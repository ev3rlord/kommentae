<?php
  require_once dirname(__DIR__) . '/includes/variables.php';

  $login_status = User::login_status();
  $title = 'Kommentae';
  require_once dirname(__DIR__) . '/includes/header.php';
?>
<?php if(!$login_status) { ?>
<div class="home-content">
  <div class="content-center content-form">
    <form class="base-form user-form">
      <div class="user-form__container">
        <h2>Login</h2>
        <div class="base-form__warning user-form__warning"></div>
        <div class="base-form__field user-form__field user-form__field-username">
          <span class="user-form__icon"><i class="fa fa-user-o" aria-hidden="true"></i></span>
          <input type="text" placeholder="Username" tabindex="1">
        </div>

        <div class="base-form__field user-form__field user-form__field-email user-form__field--hide">
          <span class="user-form__icon"><i class="fa fa-envelope-o" aria-hidden="true"></i></span>
          <input type="email" placeholder="Email" tabindex="3">
        </div>

        <div class="base-form__field user-form__field user-form__field-password">
          <span class="user-form__icon"><i class="fa fa-key" aria-hidden="true"></i></span>
          <input type="password" placeholder="Password" tabindex="2">
        </div>

        <div class="reset-password">Forgot password?</div>

        <div class="base-form__btn user-form__btn">
          <button type="button" class="user-form__login-btn" tabIndex="-1">Login</button>
          <button type="button" class="user-form__signup-btn" tabIndex="-1">Signup</button>
          <button type="button" class="user-form__reset-btn" tabIndex="-1">Reset</button>
        </div>
      </div>
      <div class="user-form__switch">
        Don't have an account? <span>Signup</span>
      </div>
    </form>

    <div class="content-form__footer">
      <a href="<?= $root ?>privacy-policy">Privacy Policy</a>
      <a href="<?= $root ?>terms-of-service">Terms of Service</a>
      <a href="https://github.com/ev3rlord/kommentae" class="copyright" target="_blank">&copy; Kommentae <?= Date('Y') ?></a>
    </div>
  </div>
</div>
<?php } else require_once dirname(__DIR__) . '/includes/homepage.php'; ?>
<?php require_once dirname(__DIR__) . '/includes/footer.php' ?>