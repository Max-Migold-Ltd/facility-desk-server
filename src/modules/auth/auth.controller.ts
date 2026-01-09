import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { cookieOptions } from "../../utils/cookie.util";

import bulkUploadQueue from "../jobs/queues/bulkUpload.queue";
import { NotFoundError } from "../../errors";

const authService = new AuthService();

export class AuthController {
  bulkRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.file) {
        return next(new NotFoundError("File"));
      }
      console.log("File: ", req.file);
      await bulkUploadQueue.add("process-users", {
        filePath: req.file.path,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      res.status(202).json({
        success: true,
        message: "File uploaded successfully. Processing Started",
      });
    } catch (error) {
      next(error);
    }
  };
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie("refresh_token", result.refreshToken, cookieOptions);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie("refresh_token", result.refreshToken, cookieOptions);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            message: "Refresh token not provided",
            code: "NO_REFRESH_TOKEN",
          },
        });
      }

      const result = await authService.refresh(refreshToken);

      // Set new refresh token as httpOnly cookie
      res.cookie("refresh_token", result.refreshToken, cookieOptions);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const result = await authService.me(userId!);

      // Set new refresh token as httpOnly cookie
      res.cookie("refresh_token", result.refreshToken, cookieOptions);

      res.status(200).json({
        status: true,
        data: { user: result.user, accessToken: result.accessToken },
      });
    } catch (error) {}
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie("refresh_token", cookieOptions);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
