const errorHandling = (err, req, res, next) => {
    console.error(err.stack || err);

    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Something went wrong';

    res.status(status).json({
        success: false,
        status,
        message,
    });
};

export default errorHandling;