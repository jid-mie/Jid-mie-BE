    const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Build an absolute callback URL so it matches the redirect URIs you register
const backendBase = process.env.BACKEND_URL || process.env.API_BASE_URL || 'http://localhost:3001';

// --- CẤU HÌNH GOOGLE STRATEGY ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${backendBase}/api/auth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Tìm người dùng bằng googleId
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // Nếu đã có, trả về người dùng đó
                    return done(null, user);
                } else {
                    // Nếu chưa có, kiểm tra xem có email trùng không
                    user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        // Nếu có email, cập nhật googleId cho họ
                        user.googleId = profile.id;
                        await user.save();
                        return done(null, user);
                    }

                    // Nếu không, tạo người dùng mới hoàn toàn
                    const newUser = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: Date.now().toString() + Math.random() // Tạo mật khẩu ngẫu nhiên
                    });
                    await newUser.save();
                    return done(null, newUser);
                }
            } catch (err) {
                console.error("Google Strategy Error:", err);
                return done(err, false);
            }
        }
    ));
}

// --- CẤU HÌNH FACEBOOK STRATEGY ---
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${backendBase}/api/auth/facebook/callback`,
            profileFields: ['id', 'displayName', 'emails']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ facebookId: profile.id });

                if (user) {
                    return done(null, user);
                } else {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    if (email) {
                        user = await User.findOne({ email });
                        if (user) {
                            user.facebookId = profile.id;
                            await user.save();
                            return done(null, user);
                        }
                    }

                    const newUser = new User({
                        facebookId: profile.id,
                        name: profile.displayName,
                        email: email,
                        password: Date.now().toString() + Math.random()
                    });
                    await newUser.save();
                    return done(null, newUser);
                }
            } catch (err) {
                console.error("Facebook Strategy Error:", err);
                return done(err, false);
            }
        }
    ));
}


// Hai hàm này cần thiết để Passport quản lý session đăng nhập
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
