import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, authError, signIn, signUp, signInWithOAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [socialError, setSocialError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [mode, setMode] = useState("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const from =
  location.state?.from?.pathname &&
  location.state.from.pathname !== "/"
    ? location.state.from.pathname
    : "/dashboard";

  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate, isLoading]);

  const clearMessages = () => {
    setSubmitError(null);
    setSocialError(null);
    setSuccessMessage(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || isOAuthLoading) return;

    clearMessages();

    if (!email.trim() || !password.trim()) {
      setSubmitError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn({ email: email.trim(), password: password.trim() });
        navigate(from, { replace: true });
      } else {
        await signUp({ email: email.trim(), password: password.trim() });
        setSuccessMessage(
          "Account created. Check your email to confirm your account before signing in."
        );
      }
    } catch (error) {
      setSubmitError(
        error?.message ||
          (mode === "signin"
            ? "Unable to sign in. Please try again."
            : "Unable to create account. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    if (isSubmitting || isOAuthLoading) return;

    clearMessages();
    setIsOAuthLoading(true);

    try {
      await signInWithOAuth(provider);
    } catch (error) {
      setSocialError(error?.message || "Unable to sign in with this provider.");
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleForgotPassword = () => {
    clearMessages();
    setInfoMessage("Password reset coming soon.");
  };

  if (isLoading) {
    return (
      <div className="page-content auth-page">
        <div className="empty-state">
          <h3>Checking authentication…</h3>
          <p>One moment while we verify your session.</p>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="page-content auth-page">
      <div className="auth-split">
        <section className="auth-side auth-form-panel">
          <div className="auth-brand-card">
            <Logo size={42} />
            <div>
              <p className="brand-name">Scalioz Lead CRM Lite</p>
              <p className="brand-subtitle">
                Manage leads, follow-ups, tasks and customer conversations from one simple workspace.
              </p>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-card-header">
              <p className="eyebrow">{mode === "signin" ? "Sign in" : "Create account"}</p>

              <h1>
                {mode === "signin"
                  ? "Welcome to Scalioz Lead CRM Lite"
                  : "Create your Scalioz CRM account"}
              </h1>

              <p className="page-description">
                {mode === "signin"
                  ? "Sign in to continue managing leads, follow-ups and customer conversations."
                  : "Create a secure account to start managing your sales pipeline."}
              </p>

              <div className="auth-toggle-row">
                <p>
                  {mode === "signin" ? "New here?" : "Already have an account?"}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setMode(mode === "signin" ? "signup" : "signin");
                      clearMessages();
                    }}
                  >
                    {mode === "signin" ? "Create account" : "Sign in"}
                    {mode === "signin" ? <UserPlus size={16} /> : <LogIn size={16} />}
                  </button>
                </p>
              </div>
            </div>

            <form className="lead-form" onSubmit={handleSubmit}>
              <div className="lead-form-body">
                <div className="form-row">
                  <div className="field-group full-width">
                    <label>Email</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-group full-width">
                    <label>Password</label>
                    <div className="input-with-icon">
                      <Lock size={18} />
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="forgot-row">
                  <button type="button" className="link-button subtle" onClick={handleForgotPassword}>
                    Forgot password?
                  </button>
                </div>
              </div>

              {(submitError || authError) && (
                <div className="form-error">
                  <p>{submitError || authError?.message || "Sign in failed."}</p>
                </div>
              )}

              {successMessage && (
                <div className="form-success">
                  <p>{successMessage}</p>
                </div>
              )}

              {infoMessage && (
                <div className="form-note">
                  <p>{infoMessage}</p>
                </div>
              )}

              <div className="form-actions">
                <Button type="submit" disabled={isSubmitting || isOAuthLoading || isLoading}>
                  {isSubmitting
                    ? mode === "signin"
                      ? "Signing in..."
                      : "Creating account..."
                    : mode === "signin"
                    ? "Sign in securely"
                    : "Create account"}
                </Button>
              </div>
            </form>

            <div className="divider-row">
              <span>Or continue with</span>
            </div>

            <div className="social-login-actions">
              <Button
                type="button"
                variant="secondary"
                className="social-button social-google"
                onClick={() => handleOAuthLogin("google")}
                disabled={isSubmitting || isOAuthLoading || isLoading}
              >
                <span style={{ fontWeight: 700 }}>G</span>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="social-button social-facebook"
                onClick={() => handleOAuthLogin("facebook")}
                disabled={isSubmitting || isOAuthLoading || isLoading}
              >
                <span style={{ fontWeight: 700 }}>f</span>
                Continue with Facebook
              </Button>
            </div>

            {socialError && (
              <div className="form-error">
                <p>{socialError}</p>
              </div>
            )}
          </div>
        </section>

        <aside className="auth-side auth-visual-panel">
          <div className="visual-top">
            <span className="visual-pill">Enterprise-grade CRM design</span>
            <h2>Clear pipelines, organized follow-ups, and smarter customer workflows.</h2>
            <p>
              Built for teams that need secure lead management with a premium, modern workspace.
            </p>
          </div>

          <div className="visual-content">
            <div className="visual-card visual-card-large">
              <div className="visual-card-row">
                <div>
                  <p className="visual-label">Conversion lift</p>
                  <strong>+32%</strong>
                </div>
                <div>
                  <p className="visual-label">Active leads</p>
                  <strong>1.7k</strong>
                </div>
              </div>

              <div className="visual-chart">
                <div className="chart-line"></div>
                <div className="chart-dot dot-a"></div>
                <div className="chart-dot dot-b"></div>
                <div className="chart-dot dot-c"></div>
              </div>
            </div>

            <div className="visual-card visual-card-compact">
              <div className="compact-row">
                <p>Top sequence</p>
                <strong>Outbound Growth</strong>
              </div>
              <div className="compact-row">
                <p>Tasks due</p>
                <strong>14 today</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Login;