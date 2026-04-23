import { AppError } from "../utils/AppError.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) return next(new AppError(error.details.map((d) => d.message).join(", "), 400));
  req[source] = value;
  next();
};
