import express from "express";

export const errorHandler = (
  err   : any,
  _req  : express.Request,
  res   : express.Response,
  _next : express.NextFunction
) => {
  console.error("Error:", err);

  let statusCode = parseInt(err.statusCode || err.status, 10);
  
  if (isNaN(statusCode)) {
    statusCode = 500;
  }

  res.status(statusCode).json({
    success       : false,
    message       : err.message || "Internal server error",
    errorDetails  : typeof err.status === 'string' ? err.status : undefined 
  });
};
