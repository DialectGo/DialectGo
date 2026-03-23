const errorHandling = (err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
        status: 500,
        messages: "Something went wrong",
        error: err.message
    })
}

export default errorHandling;