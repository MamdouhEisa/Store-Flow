const rolesMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.employee) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.employee.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

// Specific middlewares
const adminOnly = rolesMiddleware(['admin']);
const adminOrSales = rolesMiddleware(['admin', 'sales']);

module.exports = {
    rolesMiddleware,
    adminOnly,
    adminOrSales
};