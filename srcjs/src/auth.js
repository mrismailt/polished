var db = firebase.firestore()


const sign_in = function(email, password) {
  return auth.signInWithEmailAndPassword(email, password).then(function(user_all) {
    console.log("user", user_all.user)
    // send firebase token to shiny server.R

  }).catch(function(error) {
    toastr.error("Sign in Error: " + error.message)
    $.LoadingOverlay("hide")
    console.log('sign in error: ', error)
  })
}

$(document).on('click', '#submit_sign_in', function() {
  $.LoadingOverlay("show", loading_options)

  var email = $('#email').val()
  var password = $('#password').val()

  sign_in(email, password)

})


$(document).on("click", "#submit_register", () => {
  const email = $("#register_email").val()
  const password = $("#register_password").val()
  const password_2 = $("#register_password_verify").val()

  if (password !== password_2) {

    toastr.error("The passwords do not match")

    return
  }

  $.LoadingOverlay("show", loading_options)
  // double check that the email is in "invites" collection
  db.collection("apps")
  .doc(app_name)
  .collection("users")
  .doc(email).get().then((doc) => {

    if (doc.exists) {
      return auth.createUserWithEmailAndPassword(email, password).then((userCredential) => {

        // set authorization for this user for this Shiny app
        db.collection("apps")
        .doc(app_name)
        .collection("users")
        .doc(email)
        .set({
          invite_status: "accepted"
        }, { merge: true })
        .catch(error => {
          console.log("error setting invite status on register")
          console.log(error)
        })


        return userCredential

      }).then((userCredential) => {

        // send verification email
        userCredential.user.sendEmailVerification().catch((error) => {
          toastr.error("error sending verification email")
          toastr.error("" + error)
          console.error("error sending email verification: ", error)
        })

        return null
      }).catch(error => {

        console.log("error registering")
        console.log(error)
      })

    } else {

      swal({
        title: "Not Authorized",
        text: "You must have an invite to access this app.  Please contact the app owner to get an invite.",
        icon: "error"
      })

      return null
    }


  }).then((obj) => {
    $.LoadingOverlay("hide", loading_options)
  }).catch((error) => {
    toastr.error("" + error)
    $.LoadingOverlay("hide", loading_options)
    console.log("error registering user")
    console.log(error)
  })

})


$(document).on("click", "#reset_password", () => {
  const email = $("#email").val()

  auth.sendPasswordResetEmail(email).then(() => {
    toastr.success("Password reset email sent to " + email)
  }).catch((error) => {
    toastr.error("" + error)
    console.log("error resetting email: ", error)
  })
})


// navigate between sign in and register pages
$(document).on("click", "#go_to_register", () => {

  $("#sign_in_panel").hide()
  $("#register_panel").show()

})

$(document).on("click", "#go_to_sign_in", () => {

  $("#register_panel").hide()
  $("#sign_in_panel").show()

})


$(document).on("click", "#submit_continue_register", () => {

  const email = $("#register_email").val()

  db.collection("apps")
  .doc(app_name)
  .collection("users")
  .doc(email).get().then((doc) => {
    console.log("check user invited")
    if (doc.exists) {

      // TODO: could check invite or registration status here to see if the user is already
      // registered.  probably not worth it at the moment since it may get out of sync with actual
      // firebase auth registered users

      console.log("i ran too")
      // the user has been invited so allow the user to set their password and register
      $("#continue_registation").hide()
      $("#register_passwords").slideDown()



    } else {
      swal({
        title: "Not Authorized",
        text: "You must have an invite to access this app.  Please contact the app owner to get an invite.",
        icon: "error"
      })
    }

  }).catch(error => {
    console.log("error checking app 'users'")
    console.log(error)
  })
})