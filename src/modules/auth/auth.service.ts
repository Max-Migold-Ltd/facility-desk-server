import prisma from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password.util";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.util";
import { AuthError, ConflictError, NotFoundError } from "../../errors";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponse, UserResponse } from "./dto/auth-response.dto";

export class AuthService {
  async register(
    data: RegisterDto
  ): Promise<AuthResponse & { refreshToken: string }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Get role
    const role = await prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw new NotFoundError("Role");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: role.id,
      },
      include: {
        role: true,
        permissions: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as unknown as UserResponse,
      accessToken,
      refreshToken,
    };
  }

  async login(
    data: LoginDto
  ): Promise<AuthResponse & { refreshToken: string }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true, permissions: true },
    });

    if (!user) {
      throw new AuthError("Invalid credentials");
    }

    // Check status
    if (user.status !== "ACTIVE") {
      throw new AuthError("Account is not active");
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new AuthError("Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email
    );

    // Remove password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as unknown as UserResponse,
      accessToken,
      refreshToken,
    };
  }

  async refresh(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: { role: true, permissions: true },
        },
      },
    });

    if (!storedToken) {
      throw new AuthError("Invalid refresh token");
    }

    // Check expiration
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AuthError("Refresh token expired");
    }

    // Check user status
    if (storedToken.user.status !== "ACTIVE") {
      throw new AuthError("Account is not active");
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(storedToken.userId, storedToken.user.email);

    // Delete old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async me(userId: string): Promise<AuthResponse & { refreshToken: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, permissions: true },
    });

    if (!user) {
      throw new AuthError("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email
    );

    return {
      user: userWithoutPassword as unknown as UserResponse,
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private async generateTokens(userId: string, email: string) {
    // Generate access token
    const accessToken = generateAccessToken({
      userId,
      email,
    });

    // Generate refresh token
    const refreshTokenValue = generateRefreshToken({
      userId,
      tokenId: userId, // Using userId as tokenId for simplicity
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }
}
