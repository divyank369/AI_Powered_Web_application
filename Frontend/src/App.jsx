import Sidebar from "./Sidebar";
import "./App.css";
import Chatwindow from "./Chatwindow";
import { MyContext } from "./Mycontext";
import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Auth from "./Auth";
import { apiFetch } from "./api";

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState("checking");
    const [prompt, setPrompt] = useState("");
    // Random UUIDs avoid exposing creation time in client-generated thread IDs.
    const [currThreadId, setCurrThreadId] = useState(() => crypto.randomUUID());
    const [prevChats, setPrevChats] = useState([]);
    const [newChat, setNewChat] = useState(true);
    const [allThreads, setAllThreads] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [websiteBuilderMode, setWebsiteBuilderMode] = useState(false);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        let isMounted = true;
        apiFetch("/api/auth/me")
            .then(async (response) => response.ok ? response.json() : null)
            .then((result) => {
                if (!isMounted) return;
                if (result?.user) {
                    setUser(result.user);
                    setView("account");
                } else {
                    setView("guest");
                }
            })
            .catch(() => {
                if (isMounted) setView("guest");
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const providerValue = {
        user,
        setUser,
        isGuest: view === "guest",
        openSignIn: () => setView("sign-in"),
        continueAsGuest: () => setView("guest"),
        prompt,
        setPrompt,
        currThreadId,
        setCurrThreadId,
        newChat,
        setNewChat,
        prevChats,
        setPrevChats,
        allThreads,
        setAllThreads,
        sidebarOpen,
        setSidebarOpen,
        websiteBuilderMode,
        setWebsiteBuilderMode
    };

    let content;
    if (view === "checking") {
        content = <main className="auth-screen"><p className="auth-intro">Opening Kairos AI Chat Application…</p></main>;
    } else if (view === "sign-in") {
        content = <Auth
            googleEnabled={Boolean(googleClientId)}
            onAuthenticated={(authenticatedUser) => {
                setPrevChats([]);
                setAllThreads([]);
                setCurrThreadId(crypto.randomUUID());
                setUser(authenticatedUser);
                setView("account");
            }}
            onContinueAsGuest={() => setView("guest")}
        />;
    } else {
        content = (
            <div className="app">
                <MyContext.Provider value={providerValue}>
                    <Sidebar />
                    {sidebarOpen && (
                        <div
                            aria-hidden="true"
                            className="sidebar-backdrop"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                    <Chatwindow />
                </MyContext.Provider>
            </div>
        );
    }

    return googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
    ) : content;
}

export default App;
