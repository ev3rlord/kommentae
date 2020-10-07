# KOMMENTAE

A comment system built in PHP

[SEE THE WEBSITE](https://kommenta.000webhostapp.com/)

![kommentae](https://i.ibb.co/pXhXYrm/login.jpg)

**TODO**:

1. Design comment layout.
2. Implement email verification to allow comment privileges (only users can comment).
3. Each comment should have a like, reply, and report buttons.
4. Reports should be displayed in another page awaiting for approval from authorized users.
5. Prevent comment spam.
6. Moderator Privileges
    - Delete comments
    - Approve/Deny reports
7. Administrator Privileges
    - Approve/Deny reports
    - Ban users (admins can ONLY ban users)
    - Delete comments
8. Superuser Privileges
    - Same as Administrator privileges
    - Can ban anyone (users, mods, admins)
9. Integrate reCAPTCHA for login/registration/comments.
10. Use **PHPMailer** to send emails (password reset).
11. Buttons to style text
    - Color 
    - Font Family
    - Size (0.85rem - 2.5rem)
    - Bold/Italics
12. URL's rendered as links.
13. Image URL's rendered as images.
14. Allow users to upload/post images
15. ???


#### Directory Structure

        app/---
              |---bin/ 
                    |--server.php
              |
              |---includes/
                        |--footer.php
                        |--header.php
                        |--homepage.php
                        |--variables.php
              |
              |---php/
                    |--Comment.php
                    |--DB.php
                    |--User.php
              |
              |---public/
                        |---api/
                              |--comment.php
                              |--login.php
                              |--logout.php
                              |--reset.php
                              |--signup.php
                              |--user.php
                        |
                        |---css/
                              |--style.css
                        |
                        |---js/
                              |--script.js
                        |
                        |--.htaccess
                        |--index.php
              |
              |---src/
                    |--Chat.php
              |
              |--.gitignore
              |--README.md
          
        
#### DATABASE
IMPORT **kommentae.sql** FILE
