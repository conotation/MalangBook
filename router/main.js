module.exports = function(app, fs, con, async, crypto) {
   
    app.get('/', function(req, res) {
        var sess = req.session;
        console.log(sess);
        console.log(sess.username);
        res.render('index.ejs', {
            title: 'title',
            username: sess.username
        });
    });

    app.get('/login', function(req, res) {
       res.render('login.html');
    });

    app.get('/activelog', function (req, res) {
       res.render('mp_activity.ejs');

    });

}
