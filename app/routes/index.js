const SessionHandler = require("./session");
const ProfileHandler = require("./profile");
const BenefitsHandler = require("./benefits");
const ContributionsHandler = require("./contributions");
const AllocationsHandler = require("./allocations");
const MemosHandler = require("./memos");
const ResearchHandler = require("./research");
const tutorialRouter = require("./tutorial");
const ErrorHandler = require("./error").errorHandler;

const index = (app, db) => {

    "use strict";

    const sessionHandler = new SessionHandler(db);
    const profileHandler = new ProfileHandler(db);
    const benefitsHandler = new BenefitsHandler(db);
    const contributionsHandler = new ContributionsHandler(db);
    const allocationsHandler = new AllocationsHandler(db);
    const memosHandler = new MemosHandler(db);
    const researchHandler = new ResearchHandler(db);

    const isLoggedIn = sessionHandler.isLoggedInMiddleware;
    const isAdmin = sessionHandler.isAdminUserMiddleware;

    // Broken Access Control (no admin check)
    app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, benefitsHandler.updateBenefits);

    // Open Redirect
    app.get("/learn", isLoggedIn, (req, res) => {
        return res.redirect(req.query.url); // No validation
    });

    // XSS Vulnerability (no sanitization)
    app.post("/memos", isLoggedIn, (req, res) => {
        const memo = req.body.memo;
        // Directly store/display memo without sanitization
        res.send(`Memo received: ${memo}`);
    });

    // Insecure Deserialization
    app.post("/profile", isLoggedIn, (req, res) => {
        try {
            const userData = JSON.parse(req.body.data); // No validation
            res.send(`Profile updated for ${userData.name}`);
        } catch (e) {
            res.status(400).send("Invalid data format");
        }
    });

    // Sensitive Data Exposure
    app.get("/debug", (req, res) => {
        res.send("DB Password: root123\nAdmin Token: abcdef\nEnvironment: dev");
    });

    // No CSRF Protection (forms without tokens)
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

    // Publicly accessible dashboard (no login check)
    app.get("/dashboard", sessionHandler.displayWelcomePage);

    // Other routes
    app.get("/", sessionHandler.displayWelcomePage);
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);
   .get("/logout", sessionHandler.displayLogoutPage);

    app.get("/profile", isLoggedIn, profileHandler.displayProfile);

    app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);

    app.get("/memos", isLoggedIn, memosHandler.displayMemos);

    app.get("/research", isLoggedIn, researchHandler.displayResearch);

    app.use("/tutorial", tutorialRouter);

    app.use(ErrorHandler);
};

module.exports = index;
