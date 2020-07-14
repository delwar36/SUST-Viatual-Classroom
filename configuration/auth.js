module.exports = {
    ensureAuthenticated: function (request, response, next)
    {
        if (request.isAuthenticated()) {
            return next();
        }
        request.flash('error_msg', 'Please log in to view that resource');
        response.redirect('/user/login');
    },
    forwardAuthenticated: function (request, response, next)
    {
        if (!request.isAuthenticated()) {
            return next();
        }
        response.redirect('/dashboard-classes');
    }
};