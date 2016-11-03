module.exports = function(app, fs, con, async, crypto, multer, randomString) {
   var upload = multer({ dest : './uploads/' });
   var type = upload.single('profile');

   function alre(msg, link) {
        return "<script>if(undefined==alert(\"" + msg + "\")) location.href = \"/" + link + "\";</script>";
    }


   app.get('/myprofile', function(req, res) {
        res.render('mp_setting.ejs', {
        });
    });

   app.post('/update', type, function (req, res) {
      var data = req.body.setting;
      console.log(data);
     console.log(req.file == null);

      var q;
      if(data.repw.length == 0 && req.file != null ){
         var tmp_path = req.file.path;
         var name = randomString.generate(12);
         var target_path = 'uploads/' + name;
         var src = fs.createReadStream(tmp_path);
         var dest = fs.createWriteStream(target_path);

          q = "update user set u_profile="+con.escape(name) +"where u_id="+con.escape(data.id);
      src.pipe(dest);
      src.on('end', function() { res.send(alre("변경 완료", 'myprofile')); });
      src.on('error', function(err) { res.send(alre("변경 실패", "myprofile")); });

      } else if (req.file == null && data.repw.length > 0){ 
          q = "update user set u_pw="+con.escape(data.repw);
          res.send(alre("정보 변경 완료", "myprofile"));
      } else if (data.repw.length > 0 && req.file != null) {
         var tmp_path = req.file.path;
         var name = randomString.generate(12);
         var target_path = 'uploads/' + name;
         var src = fs.createReadStream(tmp_path);
         var dest = fs.createWriteStream(target_path);

          q = "update user set u_profile="+con.escape(name)+", u_pw="+con.escape(data.repw)+" where u_id="+con.escape(data.id);
      src.pipe(dest);
      src.on('end', function() { res.send(alre("변경 완료", 'myprofile')); });
      src.on('error', function(err) { res.send(alre("변경 실패", "myprofile")); });

      } else {
        res.send(alre("변경점 없음", "myprofile"));
      }
   });

}

