module.exports = function(app, fs, con, async, crypto) {
    
    function alre(msg, link) {
        return "<script>if(undefined==alert(\"" + msg + "\")) location.href = \"/" + link + "\";</script>";
    }

    function encrypt(text, key){
        var cipher = crypto.createCipher('aes-256-cbc', key);
        var encipheredCon = cipher.update(text, 'utf8', 'hex');
        encipheredCon += cipher.final('hex');
        return encipheredCon;
    }
    
    function decrypt(text, key){
       var decipher = crypto.createDecipher('aes-256-cbc', key);
       var decipheredPlainText = decipher.update(text, 'hex', 'utf8');
       decipheredPlainText += decipher.final('utf8');
       return decipheredPlainText;
    }

    app.post('/register', function(req, res) {
        var data = req.body.user;
        async.waterfall([
            function(callback) {
                var q = "select exists (select * from user where u_id=" + con.escape(data.id) + ");";
                con.query(q, function(e, r, f) {
                    if (e) callback("SQL ERROR", e);
                    if (r[0][Object.keys(r[0])[0]] == 1) callback("아이디 중복");
                    else callback(null);
                });
            },
            function(callback) {
                var q = "select exists (select * from user where u_email=" + con.escape(data.email) + ");";
                con.query(q, function(e, r, f) {
                    if (e) callback("SQL ERROR", e);
                    if (r[0][Object.keys(r[0])[0]] == 1) callback("이메일 중복");
                    else callback(null);
                });
            },
            function(callback) {
                var pw = encrypt(data.pw, "KEY");
                console.log(pw);
                con.query("insert into user (u_id, u_pw, u_nickname, u_email, u_q, u_a) value (" + con.escape(data.id) + "," + con.escape(pw) + "," + con.escape(data.nickname) + "," + con.escape(data.email) + "," + data.pwquiz + "," + con.escape(data.pwans) + ");",
                    function(err, rows, fields) {
                        if (err) callback("SQL ERROR", err);
                        callback(null, "가입완료");
                    });
            }
        ], function(err, result) {
            console.log("err : " + err);
            console.log("result : " + result);
            if (err == "아이디 중복") res.send(alre("이미 있는 아이디입니다", "login"));
            else if (err == "이메일 중복") res.send(alre("이미 사용된 이메일입니다.", "login"));
            else if (err == "SQL ERROR") res.send(err);
            if (result == "가입완료") res.send(alre("회원가입 완료", "login"));
        });
    });

    app.post('/login', function(req, res) {
        console.log(req.body);
        var data = req.body.user;
        async.waterfall([
            function(callback) {
                var q = "select exists (select * from user where u_id=" + con.escape(data.id) + ");";
                con.query(q, function(e, r, f) {
                    if (e) callback("SQL ERROR", e);
                    if (r[0][Object.keys(r[0])[0]] == 1) callback(null);
                    else callback("아이디 없음");
                });
            },
            function(callback) {
                var q = "select u_pw from user where u_id=" + con.escape(data.id) + " LIMIT 1";
                con.query(q, function(e, r, f) {
                    if (e) callback("SQL ERROR", e);
                    if (con.escape(decrypt(r[0]['u_pw'], "KEY")) == con.escape(data.pw)) callback(null, "로그인 성공");
                    else callback("로그인 실패");
                });
            }
        ], function(e, r) {
            console.log("err : " + e);
            console.log("result : " + r);
            if (e == "아이디 없음") res.send(alre("아이디가 존재하지 않습니다", "login"));
            else if (e == "로그인 실패") res.send(alre("로그인 실패.  아이디, 혹은 비밀번호를 확인해주세요", "login"));
            else if (e == "SQL ERROR") res.send(r);
            if (r == "로그인 성공") {
                res.send(alre("로그인 성공", ""));
                req.session.username  = data.id;
                console.log(req.session.username);
                console.log(req.session);
            };
        });
    });

    app.post('/findID', function(req, res) {
        async.waterfall([
            function(callback) {
                var data = req.body.user;
                var q = "select * from user where u_email=" + con.escape(data.email) + ";";
                console.log(q);
                con.query(q, function(e, r, f) {
                    if (e) callback("SQL ERROR", e);
                    if (r.length === 0) callback("아이디 없음");
                    else callback(null, "" + r[0]['u_id']);
                });
            }
        ], function(e, r) {
            console.log(e);
            console.log(r);
            if (e == "아이디 없음") res.send(alre("사용되지 않은 이메일입니다.", "login"));
            else if (e == "SQL ERROR") res.send(r);
            else res.send(alre("회원님의 아이디는 '" + r + "' 입니다.", "login"));
        });
    });

   app.post('/findPW', function(req, res) {
     async.waterfall([
       function (callback) {
          var data = req.body.user;
          var q = "select * from user where u_id="+con.escape(data.id)+";";
          con.query(q, function (e, r, f) {
              if (e) callback("SQL ERROR", e);
              if (r.length === 0) callback("아이디 없음"); 
              else callback(null);
          })
       },function(callback) {
                var data = req.body.user;
		var q = "select * from user where u_id="+con.escape(data.id)+";";
                con.query(q, function(e, r, f) {
                  if (e) callback("SQL ERROR", e);
                  if (r[0]['u_q'] == data.pwquiz && con.escape(r[0]['u_a']) == con.escape(data.pwans)) callback(null, "" + decrypt(r[0]['u_pw'], "KEY"));
                  else callback("비밀번호 질문 답 틀림");
                });
       }], function(e, r) {
            console.log(e);
            console.log(r);
            if(e=="아이디 없음") res.send(alre("일치하는 정보가 없습니다", "login"));
            else if(e == "비밀번호 질문 답 틀림") res.send(alre("정보가 일치하지않습니다", "login"));
            else if(e=="SQL ERROR") res.send(r);
            else res.send(alre("회원님의 비밀번호는 '" + r + "'입니다.", "login"));
    })
  });

}
