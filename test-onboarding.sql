-- Delete your onboarding record to trigger onboarding again
-- Replace 'YOUR_USER_ID' with your actual Clerk user ID

-- To find your user ID, check your browser console when logged in
-- or run: SELECT * FROM user_onboarding;

DELETE FROM user_onboarding WHERE user_id = 'YOUR_USER_ID';

-- Or delete all onboarding records (if testing):
-- DELETE FROM user_onboarding;
