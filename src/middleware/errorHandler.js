// Error handling middleware
export function errorHandler(err, req, res, next) {
  console.error("Error:", err.stack);

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);

  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
    // If AJAX request, send JSON response
    res.json({
      error: err.message || "Something went wrong!",
      status: err.status || 500,
    });
  } else {
    // If regular request, render error page
    res.render("error", {
      message: err.message || "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
}

// 404 handler
export function notFoundHandler(req, res, next) {
  const error = new Error("Page not found");
  error.status = 404;
  next(error);
}

// Database error handler
export function databaseErrorHandler(err, req, res, next) {
  if (err.code === "23505") {
    // Unique constraint violation
    req.session.error = "This item already exists";
    return res.redirect("back");
  }

  if (err.code === "23503") {
    // Foreign key constraint violation
    req.session.error = "Cannot delete this item as it is being used";
    return res.redirect("back");
  }

  // For other database errors, pass to general error handler
  next(err);
}
