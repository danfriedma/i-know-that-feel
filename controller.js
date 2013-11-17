(function(d){
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }(document));

    window.fbAsyncInit = function() {

        $('#login').show(); 
        $('#logout').hide(); 

        FB.init({
          appId      : '179538812246622',
          channelUrl : '//{http://i-know-that-feel.s3-website-us-east-1.amazonaws.com/',
          status     : true, // check login status
          cookie     : true, // enable cookies to allow the server to access the session
          xfbml      : true  // parse XFBML
        });
      }

    $('document').ready(function(){

        $('button#login').click(function() {
           FB.login(function (response) {
                console.log("login",response)
                if (response.authResponse) {
                    $('#login').hide();
                    $('#logout').show();
                    $('#post').show();
                    $('#buttonspace').hide();
                    $('#fetching').show();
                    getInitialText();
                  } else {
                    console.log('User cancelled login or did not fully authorize.');
                  }
              }, {"scope":"user_status"});
                
        });

        $('button#logout').click(function() {
            FB.logout(function(response) {
               console.log("user has logged out"); // user is now logged out
            });
            $('.feel').remove();
            $('#login').show();
            $('#logout').hide();
        });

        $('button#post').click(function() {
          $('#post').hide();
          var a = "My goodfeels: ";
          $(".goodfeel").each(function() {
            a += this.innerHTML + " ";
          }); 
          a += "<center></center>My badfeels: ";
          $(".badfeel").each(function() {
            a += this.innerHTML + " ";
          });
          console.log(a);
          FB.ui({
          method: "feed",
          caption: a,
          description: "finds the things that make you feel.",
          name: "i know that feel",
          link: "http://i-know-that-feel.s3-website-us-east-1.amazonaws.com/"
          })
        });
    });