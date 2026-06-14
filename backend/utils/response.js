const response = (status, success, message, data, error) => {
    return {
        status,
        data: {
            success,
            message,
            data,
            error
        }
    };
};

export default response;