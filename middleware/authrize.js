const authrize = (roles = []) => {
    return (req, res, next) => {
        if (!req?.user || !roles.includes(req?.user?.role?.name)) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        next();
    }
}

module.exports = authrize