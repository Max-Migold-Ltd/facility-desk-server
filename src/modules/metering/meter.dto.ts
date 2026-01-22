import { body } from "express-validator";

export const createMeterDto = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("type")
    .isIn(["CUMULATIVE", "GAUGE"])
    .withMessage("Type must be CUMULATIVE or GAUGE"),
  body("unit").isString().notEmpty().withMessage("Unit is required"),

  // Polymorphic Validation: Ensure exactly one ID is provided
  body().custom((value, { req }) => {
    const { assetId, buildingId, zoneId, spaceId } = req.body;
    const provided = [assetId, buildingId, zoneId, spaceId].filter(
      (id) => id !== undefined && id !== null,
    );

    if (provided.length === 0) {
      throw new Error(
        "Meter must be attached to an Asset, Building, Zone, or Space",
      );
    }
    if (provided.length > 1) {
      throw new Error(
        "Meter cannot be attached to multiple entities simultaneously",
      );
    }
    return true;
  }),
];

export const updateMeterDto = [
  body("name").optional().isString(),
  body("unit").optional().isString(),
];
