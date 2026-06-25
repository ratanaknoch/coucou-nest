import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { 
  User, 
  Settings,
  Flame,
  BookMarked,
  Activity,
  Check,
  Code,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Send,
  Laptop,
  Cpu,
  RefreshCw,
  Download,
  Award,
  Search,
  BookOpen,
  Globe,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Plus,
  Lock,
  X
} from "lucide-react";
import { DEFAULT_ALGORITHMS } from "./data";
import { AlgorithmicChallenge, Message, ChatSession, DownloadableModel } from "./types";

interface UserProfile {
  name: string;
  avatarSeed: string;
  role: string;
  completedIds: string[];
  currentGoal: string;
  streak: number;
}

const INITIAL_MODELS: DownloadableModel[] = [
  {
    id: "gemini-3.5",
    name: "Gemini 3.5 Flash",
    size: "Cloud API",
    description: "Multi-modal model with low latency and state-of-the-art capability.",
    downloaded: true,
    downloadProgress: 100,
    compilingPhase: "Connected"
  },
  {
    id: "phi-3",
    name: "Phi-3 Mini",
    size: "2.2 GB",
    description: "Lightweight, highly optimized local 3.8B parameters model for general logic.",
    downloaded: true,
    downloadProgress: 100,
    compilingPhase: "Cached"
  },
  {
    id: "qwen-2",
    name: "Qwen-2 Coder",
    size: "350 MB",
    description: "Fast 0.5B parameters model specialized for quick code syntax reasoning.",
    downloaded: false,
    downloadProgress: 0,
    compilingPhase: "Not Downloaded"
  },
  {
    id: "llama-3",
    name: "Llama-3 Socratic",
    size: "4.7 GB",
    description: "Powerful 8B model with deep conceptual comprehension and educational dialog weights.",
    downloaded: false,
    downloadProgress: 0,
    compilingPhase: "Not Downloaded"
  }
];

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "Binary Search boundaries info",
    model: "Gemini 3.5 Flash",
    createdAt: "2 hours ago",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Can you explain why binary search can result in an infinite loop if the pointers don't update correctly?",
        timestamp: "2 hours ago"
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "An infinite loop usually happens during binary search when high and low pointers get stuck.\n\nLet's consider this edge case:\n```ts\nlet low = 0;\nlet high = array.length - 1;\nwhile (low < high) {\n  let mid = Math.floor((low + high) / 2);\n  if (target >= array[mid]) {\n    low = mid; // potential bug\n  } else {\n    high = mid - 1;\n  }\n}\n```\nIf low = 0 and high = 1, then mid becomes 0. If the branch branches into low = mid, then low remains 0! The loop condition low < high (0 < 1) remains true forever because nothing changes.",
        timestamp: "2 hours ago"
      }
    ]
  },
  {
    id: "session-2",
    title: "SQL compound indexing guide",
    model: "Phi-3 Mini",
    createdAt: "Yesterday",
    messages: [
      {
        id: "msg-3",
        role: "user",
        content: "Is a standard single index sufficient for multi-column conditions like age & status?",
        timestamp: "Yesterday"
      },
      {
        id: "msg-4",
        role: "assistant",
        content: "In most cases, a single-column index isn't fully optimal if you frequently filter by multiple columns together (e.g. `WHERE age > 20 AND status = 'active'`). For maximum throughput, a **composite index** on both `(status, age)` yields better lookups, because database engines can scan a unified structured B-Tree sequentially instead of performing slow index merges.",
        timestamp: "Yesterday text"
      }
    ]
  }
];

const PROMPT_SUGGESTIONS = [
  {
    title: "Recursive algorithm logic",
    subtitle: "Draft a clean recursive tree walker for unbalanced nested nodes.",
    prompt: "Write a high-performance recursive tree-walking function in TypeScript that gracefully handles deeply nested, unbalanced object structures."
  },
  {
    title: "SQL indexing strategies",
    subtitle: "Explain index scans and how multi-column composite indices optimize lookups.",
    prompt: "Explain how compound B-tree indexes speed up SQL lookups, and how column ordering inside the composite key matters."
  },
  {
    title: "Debug render loops",
    subtitle: "Locate typical useEffect array dependency triggers causing memory exhaustion.",
    prompt: "What are the most common mistakes in React's useEffect lifecycle dependencies that trigger infinite rerender loops?"
  },
  {
    title: "Explain Big-O simply",
    subtitle: "Illustrate the intuitive difference between simple linear and logarithmic complexities.",
    prompt: "Explain the intuitive difference between O(N log N) and O(N) complexity with simple real-world sorting analogies."
  }
];

export function getChallengeLectures(challengeId: string) {
  const challenge = DEFAULT_ALGORITHMS.find(c => c.id === challengeId);
  const name = challenge ? challenge.name : "Concept";
  return [
    {
      id: `${challengeId}-lec-1`,
      title: `Video Lecture: Foundations of ${name}`,
      description: `Core mechanics, step-by-step invariant visualization, and pointer structures.`,
      content: `In this lecture, we decompose the core mechanics of ${name}.\n\n### Key Invariants:\n1. **Base Case Handling**: Always identify the simplest solvable input state.\n2. **Pointer Convergence**: Watch how state variables align across iterations.\n3. **Optimal Space allocation**: Learn why we can execute this in place.\n\nReview the diagrams and ensure you understand the auxiliary memory layout before proceeding to the Concept Assessment Quiz!`
    },
    {
      id: `${challengeId}-lec-2`,
      title: `Deep-Dive Reading: ${name} Complexity & Edge Conditions`,
      description: `A rigorous analysis of spatial and temporal bounds, and corner case validation.`,
      content: `### Space & Time Efficiency\n\n#### Time Complexity Analysis:\n- **Worst-case runtime**: How do unbalanced inputs or duplicate values affect execution speed?\n- **Amortized scaling**: Can some operations be cheap enough to balance expensive steps?\n\n#### Memory Footprint:\n- How do recursive calls impact stack frames? Can we implement it iteratively to keep space at constant O(1)?\n\nCarefully trace any recursive functions to avoid stack capacity exceedance under high constraint loads.`
    },
    {
      id: `${challengeId}-lec-3`,
      title: `Interactive Tracer: Dry-running ${name}`,
      description: `Simulating compiler stack frames and memory registers on input arrays.`,
      content: `### Interactive Tracer Exercise\n\nLet's dry-run ${name} step-by-step to build strong mental models.\n\n#### Setup Phase:\n1. Initialize trackers (indices, heaps, or auxiliary arrays).\n2. Iterate through input elements, watching state variables shift.\n3. Observe how early exits can avoid unnecessary computation.\n\nOnce you have completed this step, click 'Mark as Read' to log your progress on your Socratic Profile board!`
    }
  ];
}

export function renderAvatarIcon(seed: string, className: string = "w-6 h-6") {
  switch (seed) {
    case "coder":
      return <Code className={`${className} text-emerald-600`} />;
    case "thinker":
      return <Lightbulb className={`${className} text-amber-500`} />;
    case "explorer":
      return <Globe className={`${className} text-sky-500`} />;
    case "wizard":
      return <Sparkles className={`${className} text-purple-500`} />;
    case "scholar":
    default:
      return <BookOpen className={`${className} text-[#113f8c]`} />;
  }
}

export default function App() {
  // --- FIREBASE AUTHENTICATION STATES ---
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const isDemo = localStorage.getItem("coucou_nest_is_demo") === "true";
    if (isDemo) {
      return {
        uid: "demo-ratanaknm",
        email: "ratanaknm@demo.com",
        displayName: "Ratanak Noch Munny"
      };
    }
    return null;
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem("coucou_nest_is_demo") === "true";
  });
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [profileSetupRequired, setProfileSetupRequired] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>("");
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authActionLoading, setAuthActionLoading] = useState<boolean>(false);

  // Setup form states for customization
  const [setupName, setSetupName] = useState<string>("");
  const [setupRole, setSetupRole] = useState<string>("Socratic Scholar");
  const [setupAvatar, setSetupAvatar] = useState<string>("scholar");
  const [setupGoal, setSetupGoal] = useState<string>("Learn data structures & algorithms step-by-step");

  // Navigation: "landing" | "nest" | "coucou"
  const [currentPortal, setCurrentPortal] = useState<"landing" | "nest" | "coucou">("landing");

  // User Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: "Ratanak Noch Munny",
    role: "Socratic Scholar",
    avatarSeed: "scholar",
    completedIds: [],
    currentGoal: "Learn data structures & algorithms step-by-step",
    streak: 1
  });

  // Fetch / Sync profile and challenges from Firestore on Auth State Change
  useEffect(() => {
    if (isDemoMode) {
      const fetchDemoProfile = async () => {
        setAuthActionLoading(true);
        setIsProfileLoaded(false);
        try {
          const docRef = doc(db, "users", "demo-ratanaknm");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const rawName = data.name || "Ratanak Noch Munny";
            const loadedProfile: UserProfile = {
              name: rawName,
              role: data.role || "Socratic Scholar",
              avatarSeed: data.avatarSeed || "scholar",
              completedIds: data.completedIds || [],
              currentGoal: data.currentGoal || "Learn data structures & algorithms step-by-step",
              streak: data.streak || 1
            };
            setProfile(loadedProfile);
            
            if (data.challenges && Array.isArray(data.challenges)) {
              setChallenges(data.challenges);
            } else {
              const freshChallenges = DEFAULT_ALGORITHMS.map(c => ({ ...c, enrolled: false }));
              setChallenges(freshChallenges);
            }
            setIsProfileLoaded(true);
            setProfileSetupRequired(false);
          } else {
            // Brand new demo account! Automatically initialize a personalized profile
            const freshChallenges = DEFAULT_ALGORITHMS.map(c => ({ ...c, enrolled: false }));
            const loadedProfile: UserProfile = {
              name: "Ratanak Noch Munny",
              role: "Socratic Scholar",
              avatarSeed: "scholar",
              completedIds: [],
              currentGoal: "Learn data structures & algorithms step-by-step",
              streak: 1
            };

            await setDoc(docRef, {
              ...loadedProfile,
              challenges: freshChallenges
            });

            setProfile(loadedProfile);
            setChallenges(freshChallenges);
            setIsProfileLoaded(true);
            setProfileSetupRequired(false);
          }
        } catch (err) {
          console.error("Error fetching demo profile from Firestore:", err);
          setIsProfileLoaded(false);
          setProfileSetupRequired(false);
        } finally {
          setAuthActionLoading(false);
          setAuthInitialized(true);
        }
      };

      fetchDemoProfile();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setAuthActionLoading(true);
        setIsProfileLoaded(false);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const rawName = data.name || user.displayName || user.email?.split("@")[0] || "Student";
            const initialName = rawName.toLowerCase() === "ratanaknm" ? "Ratanak Noch Munny" : rawName === "Guest Student" ? "Ratanak Noch Munny" : rawName;
            const loadedProfile: UserProfile = {
              name: initialName,
              role: data.role || "Socratic Scholar",
              avatarSeed: data.avatarSeed || "scholar",
              completedIds: data.completedIds || [],
              currentGoal: data.currentGoal || "Learn data structures & algorithms step-by-step",
              streak: data.streak || 1
            };
            setProfile(loadedProfile);
            
            if (data.challenges && Array.isArray(data.challenges)) {
              setChallenges(data.challenges);
            } else {
              // New user accounts should have nothing enrolled by default!
              const freshChallenges = DEFAULT_ALGORITHMS.map(c => ({ ...c, enrolled: false }));
              setChallenges(freshChallenges);
            }
            setIsProfileLoaded(true);
            setProfileSetupRequired(false);
          } else {
            // Brand new account! Automatically initialize a personalized profile
            const rawName = user.displayName || user.email?.split("@")[0] || "Student";
            const initialName = rawName.toLowerCase() === "ratanaknm" ? "Ratanak Noch Munny" : rawName === "Guest Student" ? "Ratanak Noch Munny" : rawName;
            const freshChallenges = DEFAULT_ALGORITHMS.map(c => ({ ...c, enrolled: false }));
            const loadedProfile: UserProfile = {
              name: initialName,
              role: "Socratic Scholar",
              avatarSeed: "scholar",
              completedIds: [],
              currentGoal: "Learn data structures & algorithms step-by-step",
              streak: 1
            };

            await setDoc(docRef, {
              ...loadedProfile,
              challenges: freshChallenges
            });

            setProfile(loadedProfile);
            setChallenges(freshChallenges);
            setIsProfileLoaded(true);
            setProfileSetupRequired(false);
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
          setIsProfileLoaded(false);
          setProfileSetupRequired(false);
        } finally {
          setAuthActionLoading(false);
        }
      } else {
        setIsProfileLoaded(false);
        setProfileSetupRequired(false);
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, [isDemoMode]);

  const updateProfile = async (updatedFields: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updatedFields };
    setProfile(newProfile);
    localStorage.setItem("coucou_nest_profile", JSON.stringify(newProfile));
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setAuthActionLoading(true);
    setAuthError("");

    const inputUser = authEmail.trim().toLowerCase();
    if (inputUser === "ratanaknm") {
      if (authPassword === "liger72724") {
        // Success! Log in as demo user
        localStorage.setItem("coucou_nest_is_demo", "true");
        setIsDemoMode(true);
        setCurrentUser({
          uid: "demo-ratanaknm",
          email: "ratanaknm@demo.com",
          displayName: "Ratanak Noch Munny"
        });
        setAuthActionLoading(false);
        return;
      } else {
        setAuthError("Incorrect password. Please use liger72724 for the ratanaknm demo account.");
        setAuthActionLoading(false);
        return;
      }
    }

    try {
      await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
    } catch (err: any) {
      console.error("Sign in error:", err);
      let errMsg = "Failed to sign in. Please check your credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errMsg = "Incorrect email/username or password. Please try again.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Invalid email address format.";
      } else if (err.message) {
        errMsg = `${errMsg} (${err.message})`;
      }
      setAuthError(errMsg);
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword || !authConfirmPassword) {
      setAuthError("Please fill in all fields.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthActionLoading(true);
    setAuthError("");

    const emailToUse = authEmail.trim();
    if (emailToUse.toLowerCase() === "ratanaknm") {
      setAuthError("The username 'ratanaknm' is a reserved demo account. Please switch to 'Sign In' to log in with password 'liger72724'.");
      setAuthActionLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, emailToUse, authPassword);
    } catch (err: any) {
      console.error("Sign up error:", err);
      let errMsg = "Failed to create account. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "This email or username is already in use by another account.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Invalid email address format.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password is too weak. Please choose a stronger password.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthActionLoading(true);
    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      let errMsg = "Failed to sign in with Google. Please try again.";
      if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!setupName.trim()) {
      setAuthError("Please provide a name or nickname.");
      return;
    }
    setAuthActionLoading(true);
    setAuthError("");
    try {
      const newProfile: UserProfile = {
        name: setupName.trim(),
        role: setupRole,
        avatarSeed: setupAvatar,
        completedIds: [], // Start with ZERO completed lessons for new personalized account!
        currentGoal: setupGoal.trim() || "Learn data structures & algorithms step-by-step",
        streak: 1
      };
      
      const freshChallenges = DEFAULT_ALGORITHMS.map(c => ({ ...c, enrolled: false }));

      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, {
        ...newProfile,
        challenges: freshChallenges
      });
      
      setProfile(newProfile);
      setChallenges(freshChallenges);
      setIsProfileLoaded(true);
      setProfileSetupRequired(false);
    } catch (err: any) {
      console.error("Error writing user profile:", err);
      setAuthError(err.message || "Failed to create user profile. Please try again.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (isDemoMode) {
        localStorage.removeItem("coucou_nest_is_demo");
        setIsDemoMode(false);
        setCurrentUser(null);
      } else {
        await signOut(auth);
      }
      setProfile({
        name: "Ratanak Noch Munny",
        role: "Socratic Scholar",
        avatarSeed: "scholar",
        completedIds: [],
        currentGoal: "Learn data structures & algorithms step-by-step",
        streak: 1
      });
      setChallenges(DEFAULT_ALGORITHMS);
      setIsProfileLoaded(false);
      setCurrentPortal("landing");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<boolean>(false);

  const handleSaveSettingsProfile = async () => {
    setProfileSaving(true);
    setProfileSaveSuccess(false);
    try {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, profile, { merge: true });
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving profile to cloud:", err);
    } finally {
      setProfileSaving(false);
    }
  };

  const [quizCorrectCount, setQuizCorrectCount] = useState<number>(0);

  // --- NEST PORTAL STATE MANAGERS (Portal 1) ---
  const [nestActiveTab, setNestActiveTab] = useState<"lessons" | "profile" | "browse">("lessons");
  
  // Custom Dynamic Challenges list
  const [challenges, setChallenges] = useState<AlgorithmicChallenge[]>(() => {
    const saved = localStorage.getItem("coucou_nest_challenges");
    if (saved) return JSON.parse(saved);
    return DEFAULT_ALGORITHMS;
  });

  // Real-time Cloud Synchronization of student profile & challenges list
  useEffect(() => {
    if (authInitialized && currentUser && isProfileLoaded) {
      const userDocRef = doc(db, "users", currentUser.uid);
      setDoc(userDocRef, {
        name: profile.name,
        role: profile.role,
        avatarSeed: profile.avatarSeed,
        completedIds: profile.completedIds,
        currentGoal: profile.currentGoal,
        streak: profile.streak,
        challenges: challenges
      }, { merge: true }).catch(err => {
        console.error("Failed to sync profile & challenges to Firestore:", err);
      });
    }
  }, [profile, challenges, currentUser, authInitialized, isProfileLoaded]);

  const [selectedChallenge, setSelectedChallenge] = useState<AlgorithmicChallenge>(() => {
    const saved = localStorage.getItem("coucou_nest_challenges");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed[0];
    }
    return DEFAULT_ALGORITHMS[0];
  });

  const [customCode, setCustomCode] = useState<string>(selectedChallenge.starterCode);
  const [activeDebugStep, setActiveDebugStep] = useState<number>(0);
  const [showLessonSelector, setShowLessonSelector] = useState<boolean>(false);
  const [isStudyingActiveLesson, setIsStudyingActiveLesson] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [socraticHistory, setSocraticHistory] = useState<Message[]>([
    {
      id: "soc-init",
      role: "assistant",
      content: "Hello student! I am your Socratic guide. Instead of giving you code solutions directly, I will ask questions to activate your puzzle-solving paths. What loop boundary would you like us to examine first?",
      timestamp: "Just now"
    }
  ]);
  const [socraticInput, setSocraticInput] = useState<string>("");
  const [isSocraticLoading, setIsSocraticLoading] = useState<boolean>(false);
  const [isTutorCollapsed, setIsTutorCollapsed] = useState<boolean>(false);
  const [sandboxNotes, setSandboxNotes] = useState<string>("Evaluating the index checks with dynamic map sizes...");
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Quiz state for the selected challenge
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizPassed, setQuizPassed] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);

  // New Khan-style Lecture & Unit Test states
  const [activeLecturePopup, setActiveLecturePopup] = useState<{title: string, content: string} | null>(null);
  const [viewedLectures, setViewedLectures] = useState<Record<string, boolean>>({});
  const [isSimulatingTest, setIsSimulatingTest] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<boolean>(false);

  // Lesson Requests state
  const [requestedLessons, setRequestedLessons] = useState<{ topic: string; difficulty: string; rationale: string; date: string }[]>(() => {
    const saved = localStorage.getItem("coucou_requested_lessons");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [requestTopic, setRequestTopic] = useState<string>("");
  const [requestDifficulty, setRequestDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [requestRationale, setRequestRationale] = useState<string>("");
  const [showRequestSuccess, setShowRequestSuccess] = useState<boolean>(false);

  // Search state for marketplace
  const [marketplaceSearch, setMarketplaceSearch] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("coucou_nest_challenges", JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem("coucou_requested_lessons", JSON.stringify(requestedLessons));
  }, [requestedLessons]);

  useEffect(() => {
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setQuizFeedback(null);
    setQuizQuestionIndex(0);
    if (profile.completedIds.includes(selectedChallenge.id)) {
      setQuizPassed(true);
    } else {
      setQuizPassed(false);
    }
  }, [selectedChallenge, profile.completedIds]);

  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // --- COUCOU COMPANION STATE MANAGERS (Portal 2) ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("coucou_chat_sessions");
    if (saved) return JSON.parse(saved);
    return INITIAL_SESSIONS;
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = localStorage.getItem("coucou_chat_sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed[0].id;
    }
    return "session-1";
  });
  
  const [companionInput, setCompanionInput] = useState<string>("");
  const [isCompanionLoading, setIsCompanionLoading] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  // Model settings & selector
  const [models, setModels] = useState<DownloadableModel[]>(() => {
    const saved = localStorage.getItem("coucou_models");
    if (saved) return JSON.parse(saved);
    return INITIAL_MODELS;
  });
  const [activeModelId, setActiveModelId] = useState<string>("gemini-3.5");
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);

  // Settings Panel Model/Drawer state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<"models" | "profile" | "advanced">("models");
  
  // Custom advanced settings
  const [systemInstructionText, setSystemInstructionText] = useState<string>(
    "You are Coucou, an expert companion and helpful programming guide with clear, beautiful communication habits. Structure answers using markdown code blocks and clear bullet points."
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1024);

  // Dynamic status parameters
  const [cpuLoad, setCpuLoad] = useState<number>(18);
  const [ramUsed, setRamUsed] = useState<number>(5.4); // out of 16GB

  // PERSISTENCE EFFECT
  useEffect(() => {
    localStorage.setItem("coucou_nest_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("coucou_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("coucou_models", JSON.stringify(models));
  }, [models]);

  // Simulate dynamically fluctuating CPU and RAM details in Companion background
  useEffect(() => {
    if (currentPortal !== "coucou") return;
    const statsTimer = setInterval(() => {
      setCpuLoad(Math.floor(10 + Math.random() * 25));
      setRamUsed(parseFloat((5.1 + Math.random() * 0.8).toFixed(1)));
    }, 4000);
    return () => clearInterval(statsTimer);
  }, [currentPortal]);

  // Handle adding new custom lessons or completed status
  const toggleChallengeCompletion = (id: string) => {
    setProfile(prev => {
      const exists = prev.completedIds.includes(id);
      const nextCompleted = exists 
        ? prev.completedIds.filter(item => item !== id)
        : [...prev.completedIds, id];
      return { ...prev, completedIds: nextCompleted };
    });
  };

  const handleSelectChallenge = (challenge: AlgorithmicChallenge) => {
    setSelectedChallenge(challenge);
    setCustomCode(challenge.starterCode);
    setActiveDebugStep(0);
    setQuizQuestionIndex(0);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setQuizPassed(false);
    setQuizFeedback(null);
    setQuizCorrectCount(0);
    setIsStudyingActiveLesson(true);
    setSocraticHistory([
      {
        id: `soc-init-${challenge.id}`,
        role: "assistant",
        content: `Hi ${profile.name.split(" ")[0]}. I've cached the structure for our "${challenge.name}" lesson. Use the Step Debugger card to trace execution frames, or ask me for a hint about boundary cases.`,
        timestamp: "Just now"
      }
    ]);
    setShowLessonSelector(false);
  };

  // --- COUCOU ACTION FLOWS ---

  const handleCreateNewChat = () => {
    const selectedModelName = models.find(m => m.id === activeModelId)?.name || "Gemini 3.5 Flash";
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: `Empty prompt session`,
      model: selectedModelName,
      createdAt: "Just now",
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSessions = sessions.filter(s => s.id !== id);
    setSessions(nextSessions);
    if (activeSessionId === id && nextSessions.length > 0) {
      setActiveSessionId(nextSessions[0].id);
    } else if (nextSessions.length === 0) {
      // Create empty fallback session
      const fallback: ChatSession = {
        id: `session-fallback`,
        title: "New chat session",
        model: "Gemini 3.5 Flash",
        createdAt: "Now",
        messages: []
      };
      setSessions([fallback]);
      setActiveSessionId(fallback.id);
    }
  };

  const handleRequestNewLesson = () => {
    if (!requestTopic.trim()) return;
    
    const newId = `custom-${Date.now()}`;
    const cleanFunctionName = requestTopic.replace(/[^a-zA-Z0-9]/g, "") || "customAlgorithm";
    const functionNameLower = cleanFunctionName.charAt(0).toLowerCase() + cleanFunctionName.slice(1);
    
    const newChallenge: AlgorithmicChallenge = {
      id: newId,
      name: requestTopic,
      difficulty: requestDifficulty,
      enrolled: false, // Starts in marketplace!
      description: `Custom Requested Lesson: ${requestRationale || "Learn and master core algorithmic invariants and dynamic test cases built for this custom educational request."}`,
      starterCode: `function ${functionNameLower}(input: any): any {
  // Starter template for custom requested lesson
  console.log("Entering custom algorithm logic for ${requestTopic}...");
  return null;
}`,
      optimalComplexity: "Time: O(N) | Space: O(1)",
      testCases: [
        { input: "Custom parameter input test case #1", expected: "Successful assertion output" }
      ],
      steps: [
        { line: 1, label: "Execution Entry", action: `Initialize execution bounds for ${requestTopic}. Trace memory limits.`, stateBefore: "inputs = raw", stateAfter: "initialized = true" }
      ],
      teachingMaterials: {
        introduction: `Explore the foundational concepts of ${requestTopic}. Deep-dive into boundary conditions and optimal complexity configurations tailored for your requested syllabus!`,
        keyConcepts: [
          `Target Optimization: Analyze specific test scenarios with customized computational boundaries.`,
          `Storage Efficiency: Apply ideal constant-space paradigms where applicable.`,
          `Classroom Invariant Checks: Double check boundary assertions for all simulated indices.`
        ],
        videoPlaceholderText: `Visualizing ${requestTopic}! Watch how key parameters map to index positions step-by-step in this personalized educational walkthrough.`
      },
      quiz: [
        {
          question: `What is the standard optimal time complexity expected for your requested topic "${requestTopic}"?`,
          options: [
            "O(1) constant time",
            "O(N) linear time complexity",
            "O(N²) quadratic nested runtime",
            "O(2^N) exponential complexity"
          ],
          correctAnswerIndex: 1
        }
      ]
    };

    setChallenges(prev => [...prev, newChallenge]);
    setRequestedLessons(prev => [
      ...prev, 
      { topic: requestTopic, difficulty: requestDifficulty, rationale: requestRationale, date: new Date().toLocaleDateString() }
    ]);

    setRequestTopic("");
    setRequestRationale("");
    setShowRequestSuccess(true);
    setTimeout(() => setShowRequestSuccess(false), 4000);
  };

  const handleSendSocratic = async () => {
    if (!socraticInput.trim() || isSocraticLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: socraticInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextHistory = [...socraticHistory, userMsg];
    setSocraticHistory(nextHistory);
    setSocraticInput("");
    setIsSocraticLoading(true);

    try {
      const response = await fetch("/api/socratic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithm: selectedChallenge.name,
          code: customCode,
          notes: sandboxNotes,
          history: nextHistory
        })
      });

      const data = await response.json();
      const assistMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSocraticHistory(prev => [...prev, assistMsg]);
    } catch {
      const fallback = `Interesting approach! Let's examine line ${selectedChallenge.steps[activeDebugStep]?.line || 5}. Under current values, what would happen during unexpected inputs?`;
      setSocraticHistory(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: fallback,
        timestamp: "Just now"
      }]);
    } finally {
      setIsSocraticLoading(false);
    }
  };

  // Modern Companion Message Send
  const handleSendCompanion = async (forcedPrompt?: string) => {
    const rawInput = forcedPrompt || companionInput;
    if (!rawInput.trim() || isCompanionLoading) return;

    // Retrieve active session
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession) return;

    const activeModel = models.find(m => m.id === activeModelId);
    if (activeModel && !activeModel.downloaded) {
      // Trigger modal error alerting download is required
      setSettingsTab("models");
      setShowSettings(true);
      return;
    }

    const userMsg: Message = {
      id: `cu-${Date.now()}`,
      role: "user",
      content: rawInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update session messages instantly
    const nextMsgs = [...currentSession.messages, userMsg];
    let updatedTitle = currentSession.title;
    if (currentSession.messages.length === 0) {
      // Create readable title from the prompt
      updatedTitle = rawInput.length > 28 ? rawInput.substring(0, 26) + "..." : rawInput;
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: updatedTitle,
          messages: nextMsgs,
          model: activeModel?.name || "Alternative Model"
        };
      }
      return s;
    }));

    setCompanionInput("");
    setIsCompanionLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMsgs,
          systemInstruction: systemInstructionText,
          modelConfig: {
            temperature,
            maxTokens
          }
        })
      });

      const data = await response.json();
      const assistMsg: Message = {
        id: `ca-${Date.now()}`,
        role: "assistant",
        content: data.text || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...nextMsgs, assistMsg] };
        }
        return s;
      }));
    } catch (err) {
      const errResponse: Message = {
        id: `ca-err-${Date.now()}`,
        role: "assistant",
        content: `Error invoking Gemini API backend. Double check your API key settings or local configuration.\n\nSimulating fallback text for model request: "${rawInput}".`,
        timestamp: "Just now"
      };
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...nextMsgs, errResponse] };
        }
        return s;
      }));
    } finally {
      setIsCompanionLoading(false);
    }
  };

  // Simulate downloading model with speed & ETA
  const triggerModelDownload = (modelId: string) => {
    setModels(prev => prev.map(m => {
      if (m.id === modelId) {
        return {
          ...m,
          isDownloading: true,
          downloadProgress: 2,
          downloadSpeed: "2.4 MB/s",
          eta: "Calculating...",
          compilingPhase: "Downloading blocks..."
        };
      }
      return m;
    }));

    let progress = 2;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Phase two: Quantizing offline weights
        setModels(prev => prev.map(m => {
          if (m.id === modelId) {
            return {
              ...m,
              downloadProgress: 100,
              downloadSpeed: "0 KB/s",
              eta: "0s",
              compilingPhase: "Quantizing weights to 4-bit precision..."
            };
          }
          return m;
        }));

        setTimeout(() => {
          setModels(prev => prev.map(m => {
            if (m.id === modelId) {
              return {
                ...m,
                compilingPhase: "Mounting memory block registers..."
              };
            }
            return m;
          }));

          setTimeout(() => {
            setModels(prev => prev.map(m => {
              if (m.id === modelId) {
                return {
                  ...m,
                  downloaded: true,
                  isDownloading: false,
                  compilingPhase: "Cached"
                };
              }
              return m;
            }));
          }, 1500);

        }, 1500);

      } else {
        // Increment download progress values
        setModels(prev => prev.map(m => {
          if (m.id === modelId) {
            const speed = (20 + Math.random() * 15).toFixed(1) + " MB/s";
            const currentSizeMB = m.size.includes("GB") 
              ? parseFloat(m.size) * 1024 
              : parseFloat(m.size);
            const remainingMB = currentSizeMB * (1 - progress / 100);
            const etaSec = Math.round(remainingMB / parseFloat(speed));
            
            return {
              ...m,
              downloadProgress: progress,
              downloadSpeed: speed,
              eta: etaSec > 60 ? `${Math.floor(etaSec / 60)}m ${etaSec % 60}s` : `${etaSec}s`,
              compilingPhase: `Downloading shard ${Math.floor(progress / 20) + 1} of 5...`
            };
          }
          return m;
        }));
      }
    }, 600);
  };

  const activeChatSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || { messages: [], title: "" };

  const parsedProgressPercent = Math.round(
    (profile.completedIds.length / DEFAULT_ALGORITHMS.length) * 100
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const filteredChallenges = DEFAULT_ALGORITHMS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authInitialized) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-[#1e1e24] font-sans">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[#113f8c] text-white flex items-center justify-center font-bold text-xl shadow-lg">
            C
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold tracking-wider text-stone-700 uppercase font-mono">Initializing Socratic Cloud</h3>
            <p className="text-xs text-stone-400">Synchronizing secure student nodes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-fade-in min-h-[550px]" id="auth-gateway">
          
          {/* Decorative Socratic Banner Column */}
          <div className="md:w-5/12 bg-[#113f8c] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-stone-200/20">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <circle cx="50" cy="50" r="40" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="space-y-4 z-10 text-left">
              <div className="w-10 h-10 rounded-full bg-white text-[#113f8c] flex items-center justify-center font-bold text-lg shadow-md">
                C
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase">Socratic Academy Cloud</span>
                <h2 className="text-2xl font-serif font-bold tracking-tight">Coucou Nest</h2>
                <p className="text-xs text-stone-200/90 leading-relaxed font-light">
                  A modern, student-first sandbox for walking step-by-step through computational algorithms under Socratic guidance.
                </p>
              </div>
            </div>

            <div className="space-y-4 z-10 pt-8 border-t border-white/10 text-[11px] font-mono text-stone-300 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Persistent Study Progress Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Student Persona & Goals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Google Gemini Socratic Mentorship</span>
              </div>
            </div>

            <div className="z-10 text-[9px] text-stone-400/90 mt-6 select-none font-mono text-left">
              Secured with Firebase Authentication
            </div>
          </div>

          {/* Authentication Input Form Column */}
          <div className="md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-6">
              
              {/* Header Toggles */}
              <div className="space-y-1.5 text-left">
                <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                  {isSignUpMode ? "Create Student Account" : "Socratic Classroom Gate"}
                </h3>
                <p className="text-xs text-stone-500">
                  {isSignUpMode 
                    ? "Register below to secure your private Whiteboard Nest workspace." 
                    : "Please sign in with your student credentials to load your active stream."}
                </p>
              </div>

              {/* Toggle Selector */}
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200/60 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(false);
                    setAuthError("");
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    !isSignUpMode ? "bg-white text-stone-900 shadow-3xs" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(true);
                    setAuthError("");
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSignUpMode ? "bg-white text-stone-900 shadow-3xs" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Status/Error Messages */}
              {authError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex flex-col gap-2.5 text-xs text-left select-none">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-normal">{authError}</span>
                  </div>
                  {authError.toLowerCase().includes("operation-not-allowed") && (
                    <div className="mt-1 p-3 bg-amber-50 text-stone-800 rounded-xl border border-amber-200 text-[11px] leading-relaxed">
                      <p className="font-bold text-[#113f8c] mb-1">💡 How to fix this in your Firebase Console:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-stone-700 font-medium">
                        <li>Go to the <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#113f8c] hover:text-[#113f8c]/80">Firebase Authentication Console</a>.</li>
                        <li>Click the <strong>Sign-in method</strong> tab.</li>
                        <li>Under <strong>Sign-in providers</strong>, click <strong>Add new provider</strong> and choose <strong>Email/Password</strong>.</li>
                        <li>Toggle <strong>Enable</strong> and click <strong>Save</strong>.</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* Form elements */}
              <form onSubmit={isSignUpMode ? handleEmailSignUp : handleEmailSignIn} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Student Email or Username:</label>
                  <input
                    type="text"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="username"
                    className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs outline-none focus:border-[#113f8c] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Account Password:</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs outline-none focus:border-[#113f8c] transition-colors"
                  />
                </div>

                {isSignUpMode && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-xs font-bold text-stone-700 block">Confirm Password:</label>
                    <input
                      type="password"
                      required
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs outline-none focus:border-[#113f8c] transition-colors"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authActionLoading}
                  className="w-full mt-2 py-3 bg-[#113f8c] hover:bg-[#113f8c]/90 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:bg-stone-400 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  {authActionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isSignUpMode ? "Create Account & Continue" : "Authenticate Account"}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2 select-none">
                <div className="h-px bg-stone-200/80 flex-1"></div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">or sign in directly</span>
                <div className="h-px bg-stone-200/80 flex-1"></div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authActionLoading}
                className="w-full py-3 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:bg-stone-100 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.247-3.124C18.257 1.833 15.485 1 12.24 1 6.136 1 1.16 5.928 1.16 12s4.976 11 11.08 11c6.37 0 10.596-4.43 10.596-10.785 0-.727-.08-1.285-.175-1.93H12.24z"/>
                </svg>
                <span>Continue with Google (Already Pre-configured)</span>
              </button>

              {/* Security Banner Footer */}
              <p className="text-[10px] text-stone-400 text-center select-none">
                By entering the Socratic Nest portal, your progress logs, streaks and Companion sessions will sync securely to your own personal container in the cloud.
              </p>

            </div>
          </div>

        </div>
      </div>
    );
  }

  if (profileSetupRequired) {
    return (
      <div className="w-full min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in" id="profile-setup-wizard">
          
          {/* Header */}
          <div className="p-6 border-b border-[#e7e5e0] bg-[#faf9f6]/95 text-left">
            <span className="text-[10px] font-mono tracking-widest text-[#113f8c] font-bold uppercase block">Step 2 of 2</span>
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">Socratic Student Customization</h3>
            <p className="text-xs text-stone-500 mt-0.5">Please personalize your learning profile to bootstrap your workspace stats.</p>
          </div>

          <form onSubmit={handleCompleteSetup} className="p-6 sm:p-8 space-y-6 text-left">
            {/* Status Alert */}
            {authError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-2.5 text-xs select-none">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-normal">{authError}</span>
              </div>
            )}

            {/* Input Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Student Name or Nickname:</label>
              <input
                type="text"
                required
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                placeholder="e.g. Alex Rivera, CodeWizard99, Maya"
                className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs outline-none focus:border-[#113f8c]"
              />
            </div>

            {/* Avatar Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Select Student Avatar:</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { seed: "scholar", name: "Scholar" },
                  { seed: "coder", name: "Coder" },
                  { seed: "thinker", name: "Thinker" },
                  { seed: "explorer", name: "Explorer" },
                  { seed: "wizard", name: "Wizard" }
                ].map((item) => {
                  const isActive = setupAvatar === item.seed;
                  return (
                    <button
                      key={item.seed}
                      type="button"
                      onClick={() => setSetupAvatar(item.seed)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        isActive 
                          ? "bg-stone-50 border-[#113f8c] ring-1 ring-[#113f8c]/20 shadow-xs" 
                          : "bg-white border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                        {renderAvatarIcon(item.seed, "w-5 h-5")}
                      </div>
                      <span className="text-[10px] font-medium text-stone-600">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Student Role Toggle / Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Select Study Role Title:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Socratic Scholar",
                  "Computer Science Student",
                  "Self-taught Developer",
                  "High School Student",
                  "Competitive Programmer"
                ].map((role) => {
                  const isSel = setupRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSetupRole(role)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        isSel 
                          ? "bg-[#113f8c] text-white border-transparent" 
                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Learning Goal / Objective */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Personalized Academic Goal / Focus:</label>
              <input
                type="text"
                value={setupGoal}
                onChange={(e) => setSetupGoal(e.target.value)}
                placeholder="e.g. Master tree traversals and dynamic memory layout recursion"
                className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs outline-none focus:border-[#113f8c]"
              />
            </div>

            {/* Wizard Submit */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200/40 rounded-xl transition-colors cursor-pointer"
              >
                Cancel / Sign Out
              </button>

              <button
                type="submit"
                disabled={authActionLoading}
                className="px-6 py-2.5 bg-[#113f8c] hover:bg-[#113f8c]/90 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:bg-stone-400 transition-all flex items-center justify-center gap-1.5"
              >
                {authActionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Initialize Workspace</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#faf9f6] text-[#1e1e24] font-sans selection:bg-[#113f8c]/10 selection:text-[#113f8c]">
      
      {/* GLOBAL HIGH-CONTRASS PORTAL TOP NAVIGATION HEADER */}
      <header className="h-14 bg-white border-b border-[#e7e5e0] flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-7">
          <button 
            type="button"
            onClick={() => setCurrentPortal("landing")}
            className="flex items-center gap-2 font-display text-lg font-bold text-[#113f8c] focus:outline-none transition-opacity hover:opacity-85"
            id="brand-logo-btn"
          >
            <span className="w-7 h-7 rounded-full bg-[#113f8c] text-white flex items-center justify-center font-bold text-sm">C</span>
            <span className="tracking-tight text-stone-900 font-bold">Coucou <span className="text-[#113f8c]">Nest</span></span>
          </button>

          {/* Quick tab jump if inside portals */}
          {currentPortal !== "landing" && (
            <nav className="hidden sm:flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCurrentPortal("nest")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  currentPortal === "nest" ? "bg-white text-stone-900 shadow-xs font-semibold" : "text-stone-500 hover:text-stone-800"
                }`}
                id="portal-nest-tab"
              >
                Socratic Nest
              </button>
              <button
                type="button"
                onClick={() => setCurrentPortal("coucou")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  currentPortal === "coucou" ? "bg-white text-[#113f8c] shadow-xs font-semibold" : "text-stone-500 hover:text-stone-800"
                }`}
                id="portal-coucou-tab"
              >
                Coucou Companion
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="flex items-center gap-3 bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-1.5 text-xs font-medium" id="header-user-badge">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-stone-200">
                {renderAvatarIcon(profile.avatarSeed, "w-3.5 h-3.5")}
              </div>
              <span className="text-stone-700 hidden sm:inline font-semibold">{profile.name}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer pl-2 border-l border-stone-200/80 font-bold"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          )}
          {currentPortal !== "landing" && (
            <button
               type="button"
               onClick={() => setCurrentPortal("landing")}
               className="text-xs font-semibold text-stone-600 px-3.5 py-1.5 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 border border-stone-200"
               id="back-to-gate-btn"
            >
              Portal Gate
            </button>
          )}
          <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-mono text-stone-400 select-none bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online Nodes Active
          </span>
        </div>
      </header>

      {/* VIEW A: GATEWAY PORTAL SELECTION */}
      {currentPortal === "landing" && (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden" id="portal-selector-main">
          
          {/* SEC 1: NEST Socratic Learning Portal */}
          <section 
            onClick={() => setCurrentPortal("nest")}
            className="flex-1 bg-white p-8 md:p-16 flex flex-col justify-between cursor-pointer hover:bg-[#fafaf7] transition-all duration-300 border-b md:border-b-0 md:border-r border-[#e7e5e0] group text-left"
            id="nest-portal-card"
          >
            <div></div>
            <div className="max-w-md mx-auto space-y-6">
              <span className="text-[#113f8c] text-xs font-mono tracking-[0.2em] font-bold uppercase block">
                LEARNING TRACK
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-black text-stone-900 tracking-tight leading-none group-hover:text-[#113f8c] transition-colors">
                Whiteboard Nest
              </h1>
              <p className="text-stone-600 text-[15px] leading-relaxed font-light">
                Our lightweight Socratic whiteboard engine. Walk step-by-step through core data structures, track call stacks, and converse with a virtual mentor that guides you using educational questions instead of directly writing answers.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#113f8c] font-semibold tracking-wider uppercase group-hover:translate-x-1.5 transition-transform">
                  Enter Practice Room →
                </span>
              </div>
            </div>
            
            <div className="max-w-md mx-auto w-full border border-[#e7e5e0] rounded-xl p-4.5 bg-[#fcfcfa] text-[11px] font-mono text-stone-500 space-y-1">
              <span className="text-[10px] text-stone-400 font-bold uppercase block mb-1">NEST features:</span>
              <p>• Khan Academy-style minimalism layout</p>
              <p>• State register value mutation inspector</p>
              <p>• Collapsible/expandable Socratic helper chat</p>
            </div>
          </section>

          {/* SEC 2: COUCOU Local Companion */}
          <section 
            onClick={() => setCurrentPortal("coucou")}
            className="flex-1 bg-[#faf9f6] p-8 md:p-16 flex flex-col justify-between cursor-pointer hover:bg-[#f6f5f0] transition-all duration-300 group text-left"
            id="coucou-portal-card"
          >
            <div></div>
            <div className="max-w-md mx-auto space-y-6">
              <span className="text-amber-800 text-xs font-mono tracking-[0.2em] font-bold uppercase block">
                CHAT ASSISTANT
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-black text-stone-900 tracking-tight leading-none group-hover:text-amber-800 transition-colors">
                Coucou Companion
              </h1>
              <p className="text-stone-600 text-[15px] leading-relaxed font-light">
                A pristine, state-of-the-art chat companion with a Google Gemini-inspired minimal styling. Swap models in a click, manage background weights, customize instructions, and reference chat context history.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-semibold tracking-wider uppercase group-hover:translate-x-1.5 transition-transform">
                  Open Coucou Console →
                </span>
              </div>
            </div>

            <div className="max-w-md mx-auto w-full border border-[#e7e5e0] rounded-xl p-4.5 bg-white text-[11px] font-mono text-stone-500 space-y-1">
              <span className="text-[10px] text-[#113f8c] font-bold uppercase block mb-1">COMPANION features:</span>
              <p>• Beautiful Google Gemini user interface</p>
              <p>• Persistent local multi-session Chat History</p>
              <p>• Model download manager & prompt settings panel</p>
            </div>
          </section>

        </main>
      )}

      {/* VIEW B: ENTER NEST ARCHITECTURE */}
      {currentPortal === "nest" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#faf9f6]" id="nest-root-layout">
          
          {/* Top Tabs Bar: 4 tabs (Lessons, Browse Lessons, My Profile, Chatbot) */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#e7e5e0] bg-white px-4 md:px-6 py-3 shrink-0 gap-3" id="nest-tabs-bar">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setNestActiveTab("lessons")}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  nestActiveTab === "lessons" 
                    ? "bg-[#113f8c] text-white shadow-xs" 
                    : "text-stone-600 hover:bg-stone-50 hover:text-[#113f8c]"
                }`}
                id="tab-lessons-btn"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lessons</span>
              </button>
              
              <button
                type="button"
                onClick={() => setNestActiveTab("browse")}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  nestActiveTab === "browse" 
                    ? "bg-[#113f8c] text-white shadow-xs" 
                    : "text-stone-600 hover:bg-stone-50 hover:text-[#113f8c]"
                }`}
                id="tab-browse-btn"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Browse Lessons</span>
                <span className="sm:hidden">Browse</span>
              </button>

              <button
                type="button"
                onClick={() => setNestActiveTab("profile")}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  nestActiveTab === "profile" 
                    ? "bg-[#113f8c] text-white shadow-xs" 
                    : "text-stone-600 hover:bg-stone-50 hover:text-[#113f8c]"
                }`}
                id="tab-profile-btn"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">My Profile</span>
                <span className="sm:hidden">Profile</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTutorCollapsed(prev => !prev)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer border ${
                  !isTutorCollapsed 
                    ? "bg-amber-50 text-amber-900 border-amber-200 shadow-xs" 
                    : "bg-white border-[#e7e5e0] text-stone-600 hover:bg-stone-50"
                }`}
                id="tab-chatbot-btn"
              >
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Chatbot</span>
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!isTutorCollapsed ? "bg-amber-400" : "bg-blue-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${!isTutorCollapsed ? "bg-amber-500" : "bg-blue-500"}`}></span>
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left Content Area: renders the currently selected tab content */}
            <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-6">
              
              {/* ======================================= */}
              {/* TAB 1: MY PROFILE                       */}
              {/* ======================================= */}
              {nestActiveTab === "profile" && (
                <div className="space-y-6 animate-fade-in" id="profile-tab-content">
                  
                  {/* Modern Gamified Dashboard */}
                  <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center border-2 border-white shadow-md">
                          {renderAvatarIcon(profile.avatarSeed, "w-7 h-7")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-stone-900">{profile.name}</h2>
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 uppercase flex items-center gap-1 leading-none">
                              <Flame className="w-3 h-3 fill-amber-500 text-amber-500 border-none" /> {profile.streak} Days Streak
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{profile.role} • Apprentice Tier 3</p>
                        </div>
                      </div>
                      
                      {/* Streak and Stats Row */}
                      <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-stone-50 rounded-lg border border-stone-200/60">
                          <span className="text-xs text-stone-400 block uppercase font-mono">Mastery Level</span>
                          <span className="text-lg font-serif font-bold text-[#113f8c]">{profile.completedIds.length} Lessons</span>
                        </div>
                        <div className="text-center px-4 py-2 bg-stone-50 rounded-lg border border-stone-200/60">
                          <span className="text-xs text-stone-400 block uppercase font-mono">Active Target</span>
                          <span className="text-lg font-serif font-bold text-emerald-600">O(log N)</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Metrics exactly like Khan Academy */}
                    <div className="pt-4 border-t border-[#f4f3ef] space-y-3">
                      <div className="flex justify-between text-xs text-stone-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-[#113f8c]" />
                          <span>Dynamic Socratic Curriculum Progress</span>
                        </span>
                        <span>{profile.completedIds.length} of {challenges.length} Lessons Mastered ({Math.round((profile.completedIds.length / challenges.length) * 100)}%)</span>
                      </div>
                      
                      {/* Visual Progress Bar */}
                      <div className="w-full bg-[#f4f3ef] h-3 rounded-full overflow-hidden border border-[#e7e5e0]">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(profile.completedIds.length / challenges.length) * 100}%` }}
                        ></div>
                      </div>

                      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#113f8c] uppercase font-mono font-bold tracking-wider">Active Curriculum Objective:</span>
                          <p className="text-sm font-semibold text-stone-700 italic">
                            &ldquo;{profile.currentGoal}&rdquo;
                          </p>
                        </div>
                        
                        {/* Goal Edit Box */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newGoal = prompt("What is your current Socratic learning objective?", profile.currentGoal);
                              if (newGoal !== null && newGoal.trim() !== "") {
                                updateProfile({ currentGoal: newGoal.trim() });
                              }
                            }}
                            className="px-3 py-1.5 text-[11px] font-semibold bg-white border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 active:scale-98 transition-all cursor-pointer shadow-3xs font-sans"
                          >
                            Edit Objective
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TWO-COLUMN CURRICULUM OVERVIEW */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Ongoing/Enrolled lessons list */}
                    <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-[#113f8c]" />
                          <span>Active / Ongoing Study</span>
                        </h3>
                        <span className="text-[11px] font-mono text-[#113f8c] font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                          {challenges.filter(c => c.enrolled && !profile.completedIds.includes(c.id)).length} Lessons
                        </span>
                      </div>

                      <div className="space-y-3">
                        {challenges.filter(c => c.enrolled && !profile.completedIds.includes(c.id)).length === 0 ? (
                          <div className="text-center py-6 text-stone-400 text-xs italic">
                            No ongoing lessons! Go to Browse Lessons to enroll in new modules.
                          </div>
                        ) : (
                          challenges.filter(c => c.enrolled && !profile.completedIds.includes(c.id)).map(c => (
                            <div key={c.id} className="bg-stone-50/50 p-3.5 rounded-lg border border-stone-200/60 hover:border-stone-300 transition-colors flex items-center justify-between gap-3">
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-stone-800 font-serif">{c.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-mono uppercase ${
                                    c.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" :
                                    c.difficulty === "Medium" ? "bg-amber-50 text-amber-700" :
                                    "bg-rose-50 text-rose-700"
                                  }`}>
                                    {c.difficulty}
                                  </span>
                                  <span className="text-[10px] font-mono text-stone-400">{c.optimalComplexity}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectChallenge(c);
                                  setNestActiveTab("lessons");
                                }}
                                className="px-3 py-1.5 text-xs font-semibold bg-[#113f8c] text-white rounded-lg hover:bg-[#1a4ea3] transition-all cursor-pointer flex items-center gap-1 shadow-3xs font-sans"
                              >
                                <span>Study</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Mastered/Completed lessons list */}
                    <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Mastered Modules</span>
                        </h3>
                        <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          {profile.completedIds.length} Mastered
                        </span>
                      </div>

                      <div className="space-y-3">
                        {profile.completedIds.length === 0 ? (
                          <div className="text-center py-6 text-stone-400 text-xs italic">
                            No mastered lessons yet. Finish your first quiz to master a lesson!
                          </div>
                        ) : (
                          challenges.filter(c => profile.completedIds.includes(c.id)).map(c => (
                            <div key={c.id} className="bg-emerald-50/10 p-3.5 rounded-lg border border-emerald-200/50 hover:border-emerald-200 transition-colors flex items-center justify-between gap-3">
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-stone-800 font-serif flex items-center gap-1.5">
                                  <span>{c.name}</span>
                                  <Check className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-mono uppercase bg-emerald-50 text-emerald-700">
                                    {c.difficulty}
                                  </span>
                                  <span className="text-[10px] font-mono text-stone-400">{c.optimalComplexity}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectChallenge(c);
                                  setNestActiveTab("lessons");
                                }}
                                className="px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-all cursor-pointer flex items-center gap-1 shadow-3xs font-sans"
                              >
                                <span>Review</span>
                                <RotateCcw className="w-3 h-3 text-stone-400" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* TAB 2: LESSONS (KHAN-STYLE QUIZ & CURRIC) */}
              {/* ======================================= */}
              {nestActiveTab === "lessons" && (
                <div className="space-y-6 animate-fade-in" id="lessons-tab-content">
                  
                  {/* MODE A: CURRICULUM PATH & SELECTION BOARD */}
                  {!isStudyingActiveLesson ? (
                    <div className="space-y-6" id="lessons-selector-dashboard">
                      
                      {/* Premium Unit Header & Hero */}
                      <div className="bg-[#113f8c] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm border border-[#0d316e]">
                        {/* Abstract background vector patterns for mathematical feel */}
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none select-none hidden md:block">
                          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-white">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
                            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                          </svg>
                        </div>

                        <div className="space-y-3 max-w-2xl relative z-10">
                          <span className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-300/30">
                            UNIT 1: FOUNDATIONS OF ALGORITHMIC OPTIMIZATION
                          </span>
                          <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tight leading-tight">
                            The Socratic Path to Mastery
                          </h2>
                          <p className="text-xs md:text-sm text-stone-200 leading-relaxed font-light">
                            Explore classic logical puzzles. Instead of copy-pasting answers, use our line-by-line Socratic Tracer and the interactive chatbot to truly absorb memory registers, loops, and index mutations.
                          </p>

                          <div className="flex flex-col sm:flex-row gap-3 pt-3">
                            {/* Search bar inside header */}
                            <div className="flex-1 bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl px-3.5 py-2 flex items-center gap-2 text-white">
                              <Search className="w-4 h-4 text-stone-300 shrink-0" />
                              <input 
                                type="text"
                                className="flex-1 bg-transparent border-none text-xs text-white placeholder-stone-300 outline-none"
                                placeholder="Search our curriculum path..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                              {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery("")} className="text-stone-300 hover:text-white">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Request Lesson quick action */}
                            <a 
                              href="#request-curriculum-panel"
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Plus className="w-4 h-4 text-stone-950" />
                              <span>Request Custom Lesson</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Active & Mastered Columns (Split Easy Selection Board) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Left Column: Active / Ongoing Study Path */}
                        <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5 font-display">
                              <Activity className="w-4 h-4 text-[#113f8c]" />
                              <span>Active / Ongoing Study Track</span>
                            </h3>
                            <span className="text-[10px] font-mono text-stone-500 font-semibold bg-stone-100 px-2 py-0.5 rounded-full">
                              {challenges.filter(c => c.enrolled && !profile.completedIds.includes(c.id)).length} Lessons
                            </span>
                          </div>

                          <div className="space-y-3">
                            {challenges.filter(c => 
                              (!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                              c.enrolled && !profile.completedIds.includes(c.id)
                            ).length === 0 ? (
                              <div className="text-center py-10 text-stone-400 text-xs italic">
                                {searchQuery ? "No matching active lessons found." : "All enrolled lessons have been mastered! Enroll in more from the marketplace."}
                              </div>
                            ) : (
                              challenges.filter(c => 
                                (!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                                c.enrolled && !profile.completedIds.includes(c.id)
                              ).map(c => {
                                // Calculate lecture completion progress for sub-lectures
                                const lectures = getChallengeLectures(c.id);
                                const viewedCount = lectures.filter(l => viewedLectures[l.id]).length;
                                const progressPct = Math.round((viewedCount / lectures.length) * 100);

                                return (
                                  <div key={c.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/30 hover:border-stone-300 hover:bg-white transition-all duration-200 shadow-3xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-stone-900 font-serif">{c.name}</h4>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                                          c.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                          c.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                          "bg-rose-50 text-rose-700 border border-rose-100"
                                        }`}>{c.difficulty}</span>
                                      </div>
                                      <p className="text-xs text-stone-500 line-clamp-1 font-light">{c.description}</p>
                                      
                                      {/* Mini Progress Bar for theoretical lecture read status */}
                                      <div className="flex items-center gap-2 pt-1">
                                        <div className="w-16 bg-stone-200 h-1 rounded-full overflow-hidden">
                                          <div className="bg-[#113f8c] h-full" style={{ width: `${progressPct}%` }}></div>
                                        </div>
                                        <span className="text-[9px] font-mono text-stone-400 font-medium">
                                          Lectures Read: {viewedCount}/{lectures.length} ({progressPct}%)
                                        </span>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectChallenge(c);
                                        setIsStudyingActiveLesson(true);
                                      }}
                                      className="px-4 py-2 text-xs font-bold bg-[#113f8c] text-white rounded-lg hover:bg-[#1a4ea3] transition-all cursor-pointer shadow-3xs font-sans flex items-center gap-1 shrink-0 w-full md:w-auto justify-center"
                                    >
                                      <span>Resume Study</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Right Column: Mastered Modules */}
                        <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5 font-display">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>Mastered Milestones</span>
                            </h3>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                              {profile.completedIds.length} Mastered
                            </span>
                          </div>

                          <div className="space-y-3">
                            {challenges.filter(c => 
                              (!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                              profile.completedIds.includes(c.id)
                            ).length === 0 ? (
                              <div className="text-center py-10 text-stone-400 text-xs italic">
                                {searchQuery ? "No matching mastered lessons found." : "Finish your first mastery quiz to lock in a gold module badge!"}
                              </div>
                            ) : (
                              challenges.filter(c => 
                                (!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                                profile.completedIds.includes(c.id)
                              ).map(c => (
                                <div key={c.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/5 hover:bg-emerald-50/10 transition-all duration-200 shadow-3xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                  <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-1.5">
                                        <span>{c.name}</span>
                                        <Check className="w-4 h-4 text-emerald-500 fill-emerald-100 shrink-0" />
                                      </h4>
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        100% MASTERY
                                      </span>
                                    </div>
                                    <p className="text-xs text-stone-500 line-clamp-1 font-light">{c.description}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
                                      <span>Complexity: {c.optimalComplexity}</span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSelectChallenge(c);
                                      setIsStudyingActiveLesson(true);
                                    }}
                                    className="px-4 py-2 text-xs font-semibold bg-white border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-all cursor-pointer shadow-3xs font-sans flex items-center gap-1 shrink-0 w-full md:w-auto justify-center"
                                  >
                                    <span>Review Lesson</span>
                                    <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Khan-style Connected Timeline Path (Interactive Course Map) */}
                      <div className="bg-white border border-[#e7e5e0] rounded-xl p-6 shadow-xs space-y-6">
                        <div className="border-b border-stone-100 pb-3">
                          <h3 className="text-sm font-bold text-stone-900 font-serif">Unit 1 Curriculum Timeline & Milestones</h3>
                          <p className="text-xs text-stone-500 mt-0.5">Explore the interconnected logical prerequisites. Complete quizzes to unlock and level up.</p>
                        </div>

                        {/* Connected dot timeline representation */}
                        <div className="relative py-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 max-w-4xl mx-auto">
                          
                          {/* Horizontal line for desktop, vertical line for mobile */}
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 -translate-y-1/2 hidden md:block z-0"></div>
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone-200 -translate-x-1/2 md:hidden z-0"></div>

                          {challenges.map((c, index) => {
                            const isCompleted = profile.completedIds.includes(c.id);
                            const isActive = c.id === selectedChallenge.id;
                            const isEnrolled = c.enrolled;

                            let nodeStyle = "bg-white border-stone-300 text-stone-400 hover:border-[#113f8c] hover:text-[#113f8c]";
                            if (isCompleted) {
                              nodeStyle = "bg-emerald-500 border-emerald-600 text-white shadow-sm ring-4 ring-emerald-50";
                            } else if (isActive) {
                              nodeStyle = "bg-[#113f8c] border-[#113f8c] text-white shadow-sm ring-4 ring-blue-50 animate-pulse";
                            } else if (isEnrolled) {
                              nodeStyle = "bg-blue-50 border-blue-300 text-[#113f8c] ring-2 ring-blue-50";
                            }

                            return (
                              <div key={c.id} className="relative z-10 flex flex-col items-center max-w-[150px] text-center space-y-2">
                                {/* Node Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectChallenge(c);
                                    setIsStudyingActiveLesson(true);
                                  }}
                                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer font-bold ${nodeStyle}`}
                                  title={`Study ${c.name}`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-6 h-6 fill-emerald-100/10 text-white" />
                                  ) : (
                                    <span className="text-xs font-mono">{index + 1}</span>
                                  )}
                                </button>

                                {/* Name & status info */}
                                <div className="space-y-0.5 bg-white md:bg-transparent p-2 md:p-0 rounded-lg border md:border-none border-stone-200">
                                  <span className="text-[11px] font-bold text-stone-800 line-clamp-1 block leading-tight font-serif">
                                    {c.name}
                                  </span>
                                  <span className="text-[9px] font-mono text-stone-400 block uppercase tracking-wider">
                                    {isCompleted ? "Completed" : isActive ? "Active" : isEnrolled ? "In Progress" : "Available"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* DEDICATED OPTION TO REQUEST LESSONS (Curriculum Panel) */}
                      <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4" id="request-curriculum-panel">
                        <div className="border-b border-stone-100 pb-2">
                          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-[#113f8c]" />
                            <span>Request Custom Classroom Lesson</span>
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-0.5">Need a specific algorithm designed with a Socratic debugger and quizzes? Request it now!</p>
                        </div>

                        {showRequestSuccess && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 animate-fade-in flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Your custom lesson topic has been requested! Our interactive model will compile a socratic checklist for you.</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-stone-500 block uppercase">Topic / Algorithm Name</label>
                            <input
                              type="text"
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 outline-none focus:bg-white focus:border-[#113f8c] transition-colors"
                              placeholder="e.g. Depth First Search, LRU Cache..."
                              value={requestTopic}
                              onChange={(e) => setRequestTopic(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-stone-500 block uppercase">Intended Difficulty</label>
                            <select
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 outline-none focus:bg-white focus:border-[#113f8c] transition-colors"
                              value={requestDifficulty}
                              onChange={(e) => setRequestDifficulty(e.target.value as any)}
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-stone-500 block uppercase">Why do you want to learn this?</label>
                            <input
                              type="text"
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 outline-none focus:bg-white focus:border-[#113f8c] transition-colors"
                              placeholder="e.g. Preparing for interviews, school exams..."
                              value={requestRationale}
                              onChange={(e) => setRequestRationale(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            disabled={!requestTopic}
                            onClick={() => {
                              if (!requestTopic) return;
                              const newReq = {
                                topic: requestTopic,
                                difficulty: requestDifficulty,
                                rationale: requestRationale,
                                date: new Date().toLocaleDateString()
                              };
                              setRequestedLessons(prev => [newReq, ...prev]);
                              setRequestTopic("");
                              setRequestRationale("");
                              setShowRequestSuccess(true);
                              setTimeout(() => setShowRequestSuccess(false), 5000);
                            }}
                            className="px-5 py-2 text-xs font-bold bg-[#113f8c] text-white rounded-lg hover:bg-[#1a4ea3] disabled:opacity-40 transition-all cursor-pointer shadow-3xs font-sans"
                          >
                            Submit Lesson Request
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    
                    /* MODE B: DETAILED KHAN-STYLE ACTIVE LESSON COUPE */
                    <div className="space-y-6" id="lessons-study-view">
                      
                      {/* Top Sticky Breadcrumb Banner & Lesson Nav */}
                      <div className="bg-white border border-[#e7e5e0] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsStudyingActiveLesson(false);
                              setQuizSelectedOption(null);
                              setQuizSubmitted(false);
                              setQuizFeedback(null);
                            }}
                            className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 cursor-pointer shadow-3xs flex items-center justify-center transition-colors"
                            title="Back to Directory"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <span className="text-[9px] font-mono text-[#113f8c] uppercase tracking-wider block">Foundational Course Path</span>
                            <h3 className="text-lg font-serif font-bold text-stone-900 leading-tight">
                              {selectedChallenge.name} Deep Study
                            </h3>
                          </div>
                        </div>

                        {/* Quick Study Tracker Indicators */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            selectedChallenge.difficulty === "Easy" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                            selectedChallenge.difficulty === "Medium" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                            "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}>{selectedChallenge.difficulty}</span>

                          <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
                            Complexity: {selectedChallenge.optimalComplexity}
                          </span>

                          {profile.completedIds.includes(selectedChallenge.id) ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 font-bold">
                              ✓ Completed
                            </span>
                          ) : (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold">
                              <Activity className="w-3 h-3 animate-pulse" /> In Progress
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Two-Column Classroom Panel */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* Left Classroom Course Desk (8/12 Columns) */}
                        <div className="lg:col-span-8 space-y-6">
                          
                          {/* CARD A: THEORETICAL OVERVIEW (Origins & Lectures) */}
                          <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4">
                            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 font-serif">
                                <BookMarked className="w-4 h-4 text-[#113f8c]" />
                                <span>Theoretical Overview & Lectures</span>
                              </h4>
                              <span className="text-[10px] font-mono text-stone-400">Section 1 of 4</span>
                            </div>

                            {/* Conceptual Overview Intro block */}
                            <div className="space-y-3">
                              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                                {selectedChallenge.description}
                              </p>
                              
                              <p className="text-xs text-stone-700 leading-relaxed font-serif italic bg-[#113f8c]/5 p-3 rounded-lg border-l-4 border-[#113f8c]">
                                &ldquo;{selectedChallenge.teachingMaterials?.introduction || "Master this fundamental optimization puzzle."}&rdquo;
                              </p>
                            </div>

                            {/* In-app Socratic Lectures list */}
                            <div className="space-y-2.5 pt-3">
                              <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase tracking-wider">Required Reading & Concept Videos:</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {getChallengeLectures(selectedChallenge.id).map((lecture, idx) => {
                                  const isViewed = viewedLectures[lecture.id];
                                  return (
                                    <button
                                      key={lecture.id}
                                      type="button"
                                      onClick={() => setActiveLecturePopup(lecture)}
                                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3 ${
                                        isViewed 
                                          ? "bg-emerald-50/20 border-emerald-200 hover:border-emerald-300" 
                                          : "bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-white"
                                      }`}
                                    >
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        isViewed ? "bg-emerald-100 text-emerald-800" : "bg-[#113f8c]/10 text-[#113f8c]"
                                      }`}>
                                        {isViewed ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                      </div>
                                      <div className="space-y-0.5">
                                        <h5 className="text-xs font-bold text-stone-800 line-clamp-1">{lecture.title}</h5>
                                        <p className="text-[10px] text-stone-400 line-clamp-1">{lecture.description}</p>
                                        <span className="text-[9px] font-mono text-[#113f8c] font-semibold mt-1 block">
                                          {isViewed ? "Viewed ✓" : "Start Video / Reading →"}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <p className="text-[10px] text-stone-400 font-sans italic pt-1">
                              💡 Tip: Reading these concepts prepares you perfectly for the Practice Assessment Quiz down below!
                            </p>
                          </div>

                          {/* CARD B: INTERACTIVE MEMORY TRACER (Socratic Step Debugger) */}
                          <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4" id="nest-step-debugger-card">
                            <div className="flex items-center justify-between border-b border-[#f4f3ef] pb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-[#113f8c]/10 text-[#113f8c]">
                                  <Code className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-stone-900 font-serif">Socratic Memory Stack & Variable Tracer</h4>
                                  <p className="text-[10px] text-stone-500 font-mono">Section 2 of 4 • Trace mutable register frames</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-md p-0.5 shrink-0">
                                <button
                                  type="button"
                                  disabled={activeDebugStep === 0}
                                  onClick={() => setActiveDebugStep(prev => Math.max(0, prev - 1))}
                                  className="p-1 px-2.5 text-[10px] font-mono text-stone-600 hover:bg-white rounded transition-colors disabled:opacity-35 cursor-pointer font-bold"
                                >
                                  ◄ Prev
                                </button>
                                <span className="text-[10px] font-mono text-stone-700 px-2 font-bold select-none">
                                  {activeDebugStep + 1} / {selectedChallenge.steps.length}
                                </span>
                                <button
                                  type="button"
                                  disabled={activeDebugStep === selectedChallenge.steps.length - 1}
                                  onClick={() => setActiveDebugStep(prev => Math.min(selectedChallenge.steps.length - 1, prev + 1))}
                                  className="p-1 px-2.5 text-[10px] font-mono text-stone-600 hover:bg-white rounded transition-colors disabled:opacity-35 cursor-pointer font-bold"
                                >
                                  Next ►
                                </button>
                              </div>
                            </div>

                            {/* Active Trace action */}
                            <div className="p-3 bg-stone-50 border border-stone-200 rounded text-stone-800 font-mono text-xs italic">
                              <span className="text-[9px] text-[#113f8c] font-bold block uppercase not-italic tracking-wider mb-1 font-sans flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#113f8c]" />
                                <span>Active Trace Pointer Line {selectedChallenge.steps[activeDebugStep]?.line} — {selectedChallenge.steps[activeDebugStep]?.label}</span>
                              </span>
                              &ldquo;{selectedChallenge.steps[activeDebugStep]?.action}&rdquo;
                            </div>

                            {/* Heap / Variable frame states before & after */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-[#faf9f6] border border-[#e7e5e0] p-3 rounded font-mono text-xs shadow-3xs">
                                <span className="text-[9px] text-stone-400 uppercase font-bold tracking-tight block mb-1 font-sans">Before Mutating State:</span>
                                <code className="text-stone-700 text-[10px] block break-all whitespace-pre-wrap">{selectedChallenge.steps[activeDebugStep]?.stateBefore}</code>
                              </div>
                              <div className="bg-emerald-50/30 border border-emerald-200 p-3 rounded font-mono text-xs shadow-3xs">
                                <span className="text-[9px] text-emerald-700 uppercase font-bold tracking-tight block mb-1 font-sans">After Mutating State:</span>
                                <code className="text-emerald-800 text-[10px] block break-all whitespace-pre-wrap">{selectedChallenge.steps[activeDebugStep]?.stateAfter}</code>
                              </div>
                            </div>

                            {/* Dynamic memory tracer grids */}
                            <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg flex flex-col items-center justify-center">
                              <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest mb-3">
                                Visual Memory Registers:
                              </span>
                              
                              {selectedChallenge.id === "two-sum" && (
                                <div className="flex flex-col gap-3 w-full items-center">
                                  <div className="flex gap-2.5">
                                    {[2, 7, 11, 15].map((val, idx) => {
                                      const isCurrent = (activeDebugStep === 1 && idx === 0) || 
                                                        (activeDebugStep === 2 && idx === 0) ||
                                                        (activeDebugStep === 3 && idx === 0) ||
                                                        (activeDebugStep === 4 && idx === 1) ||
                                                        (activeDebugStep === 5 && idx === 1) ||
                                                        (activeDebugStep === 6 && idx === 1);
                                      return (
                                        <div key={idx} className="flex flex-col items-center">
                                          <span className="text-[9px] font-mono text-stone-400 mb-0.5">idx {idx}</span>
                                          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                            isCurrent ? "bg-[#113f8c] text-white border-[#113f8c] scale-105 shadow-sm" : "bg-white border-stone-300 text-stone-500"
                                          }`}>
                                            {val}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {selectedChallenge.id === "valid-parentheses" && (
                                <div className="flex flex-col items-center w-full">
                                  <div className="flex gap-2.5">
                                    {["(", "[", "]"].map((ch, idx) => {
                                      const isCurrent = (activeDebugStep === 1 && idx === 0) ||
                                                        (activeDebugStep === 2 && idx === 1) ||
                                                        (activeDebugStep === 3 && idx === 2);
                                      return (
                                        <div key={idx} className="flex flex-col items-center">
                                          <span className="text-[9px] font-mono text-stone-400 mb-0.5">char {idx}</span>
                                          <span className={`px-3 py-1.5 border rounded-lg text-xs font-mono font-bold ${
                                            isCurrent ? "bg-amber-100 border-amber-300 text-amber-950" : "bg-white text-stone-400 border-stone-200"
                                          }`}>{ch}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {selectedChallenge.id === "binary-search" && (
                                <div className="flex gap-2.5">
                                  {[-1, 0, 3, 5, 9, 12].map((val, idx) => {
                                    const isMid = (activeDebugStep === 1 && idx === 2) || (activeDebugStep === 2 && idx === 2);
                                    const isMidNarrow = (activeDebugStep === 3 && idx === 3) || (activeDebugStep === 4 && idx === 3);
                                    const highlight = isMid || isMidNarrow;
                                    return (
                                      <div key={idx} className="flex flex-col items-center">
                                        <span className="text-[9px] font-mono text-stone-400 mb-0.5">idx {idx}</span>
                                        <div className={`px-2.5 py-1.5 rounded-md border text-xs font-mono font-bold ${
                                          highlight ? "bg-[#113f8c] border-[#113f8c] text-white shadow-xs scale-105" : "bg-white text-stone-400 border-stone-200"
                                        }`}>{val}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {!["two-sum", "valid-parentheses", "binary-search"].includes(selectedChallenge.id) && (
                                <div className="text-center py-4 text-xs font-mono text-stone-400 italic">
                                  Step visualizer active. Click Next/Prev above to observe state boundaries.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* CARD C: CODE REFERENCE & SANDBOX */}
                          <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-3" id="nest-code-reference-card">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                              <span className="text-xs font-mono text-stone-400 uppercase tracking-wider font-bold">Classroom Code Template Reference</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(customCode)}
                                className="text-[10px] font-mono text-[#113f8c] py-1 px-2.5 rounded-lg hover:bg-stone-100 border border-stone-200 transition-colors flex items-center gap-1 cursor-pointer font-sans"
                              >
                                {copiedText ? "Copied!" : "Copy Code"}
                              </button>
                            </div>
                            <pre className="p-3.5 bg-stone-50 border border-stone-200 text-xs font-mono text-emerald-800 rounded-md overflow-x-auto leading-relaxed whitespace-pre">
                              {customCode}
                            </pre>
                          </div>

                          {/* CARD D: PRACTICE ASSESSMENT QUIZ */}
                          <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4" id="nest-assessment-quiz-card">
                            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase flex items-center gap-1">
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Concept Practice Assessment (Section 3 of 4)</span>
                                </span>
                                <h4 className="text-base font-serif text-stone-900 mt-1">Challenge Assessment Quiz</h4>
                              </div>
                              <span className="text-xs font-mono text-stone-400">Correct: {quizCorrectCount} / {selectedChallenge.quiz?.length || 0}</span>
                            </div>

                            {!selectedChallenge.quiz || selectedChallenge.quiz.length === 0 ? (
                              <div className="text-stone-400 text-xs italic py-4 text-center">No quiz available for this topic yet. Check back soon!</div>
                            ) : (
                              <div className="space-y-5">
                                
                                {/* Progress Indicator */}
                                <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                                  <span>Question {quizQuestionIndex + 1} of {selectedChallenge.quiz.length}</span>
                                  <span className="bg-stone-100 px-2.5 py-0.5 rounded text-[10px] font-mono">
                                    Required to Pass: 100%
                                  </span>
                                </div>

                                {/* Quiz Question Card */}
                                <div className="bg-[#faf9f6] border border-stone-200/80 rounded-xl p-4 md:p-5 space-y-4">
                                  <p className="text-sm font-medium text-stone-800 font-sans leading-relaxed">
                                    {selectedChallenge.quiz[quizQuestionIndex].question}
                                  </p>

                                  {/* Multiple Choice Options */}
                                  <div className="grid grid-cols-1 gap-2.5">
                                    {selectedChallenge.quiz[quizQuestionIndex].options.map((option, idx) => {
                                      const isSelected = quizSelectedOption === idx;
                                      const isCorrectAnswer = idx === selectedChallenge.quiz[quizQuestionIndex].correctAnswerIndex;
                                      
                                      let buttonStyle = "bg-white border-stone-300 hover:bg-stone-50 text-stone-700";
                                      if (isSelected) {
                                        buttonStyle = "bg-[#113f8c]/10 border-[#113f8c] text-[#113f8c] font-semibold";
                                      }
                                      
                                      if (quizSubmitted) {
                                        if (isCorrectAnswer) {
                                          buttonStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold";
                                        } else if (isSelected && !isCorrectAnswer) {
                                          buttonStyle = "bg-rose-50 border-rose-400 text-rose-800";
                                        } else {
                                          buttonStyle = "bg-white border-stone-200 text-stone-400 opacity-60";
                                        }
                                      }

                                      return (
                                        <button
                                          key={idx}
                                          type="button"
                                          disabled={quizSubmitted}
                                          onClick={() => setQuizSelectedOption(idx)}
                                          className={`w-full p-3 text-xs text-left rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${buttonStyle}`}
                                        >
                                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 font-mono text-[10px] ${
                                            isSelected ? "bg-[#113f8c] text-white border-transparent" : "border-stone-400 text-stone-400 bg-stone-50"
                                          }`}>
                                            {String.fromCharCode(65 + idx)}
                                          </span>
                                          <span className="leading-relaxed">{option}</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Submit & Navigation Area */}
                                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                                    
                                    {/* Quiz feedback text */}
                                    <div className="text-xs">
                                      {quizFeedback && (
                                        <p className={`font-medium flex items-center gap-1 animate-fade-in ${
                                          quizFeedback.includes("correct") || quizFeedback.includes("Finished") ? "text-emerald-700" : "text-amber-800"
                                        }`}>
                                          {quizFeedback.includes("correct") || quizFeedback.includes("Finished") ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                          <span>{quizFeedback}</span>
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {!quizSubmitted ? (
                                        <button
                                          type="button"
                                          disabled={quizSelectedOption === null}
                                          onClick={() => {
                                            if (quizSelectedOption === null) return;
                                            const isCorrect = quizSelectedOption === selectedChallenge.quiz[quizQuestionIndex].correctAnswerIndex;
                                            setQuizSubmitted(true);
                                            if (isCorrect) {
                                              setQuizCorrectCount(prev => prev + 1);
                                              setQuizFeedback("Excellent! That is absolutely correct.");
                                            } else {
                                              setQuizFeedback("Not quite! Look closer at the concepts of this lesson.");
                                            }
                                          }}
                                          className="px-4 py-2 text-xs font-bold bg-[#113f8c] text-white rounded-lg hover:bg-[#1a4ea3] active:scale-98 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer shadow-3xs font-sans"
                                        >
                                          Submit Answer
                                        </button>
                                      ) : (
                                        <>
                                          {quizQuestionIndex < selectedChallenge.quiz.length - 1 ? (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setQuizQuestionIndex(prev => prev + 1);
                                                setQuizSelectedOption(null);
                                                setQuizSubmitted(false);
                                                setQuizFeedback(null);
                                              }}
                                              className="px-4 py-2 text-xs font-bold bg-stone-800 text-white hover:bg-stone-700 rounded-lg active:scale-98 transition-all cursor-pointer shadow-3xs flex items-center gap-1 font-sans"
                                            >
                                              <span>Next Question</span>
                                              <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const finalCorrect = quizSelectedOption === selectedChallenge.quiz[quizQuestionIndex].correctAnswerIndex ? quizCorrectCount + 1 : quizCorrectCount;
                                                if (finalCorrect === selectedChallenge.quiz.length) {
                                                  setQuizPassed(true);
                                                } else {
                                                  setQuizPassed(false);
                                                }
                                                setQuizFeedback("Quiz Finished!");
                                              }}
                                              className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg active:scale-98 transition-all cursor-pointer shadow-3xs font-sans"
                                            >
                                              Evaluate Score
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* FINAL SCORE EVALUATION SCREENS */}
                                {quizSubmitted && quizFeedback === "Quiz Finished!" && (
                                  <div className="p-4 rounded-lg animate-fade-in border text-center space-y-3 bg-white">
                                    {quizCorrectCount === selectedChallenge.quiz.length ? (
                                      <div className="space-y-2">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto border-2 border-white shadow-xs">
                                          <Award className="w-6 h-6" />
                                        </div>
                                        <h5 className="text-sm font-bold text-emerald-800 font-display">100% CONCEPT MASTERY REACHED!</h5>
                                        <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                                          Incredible work! You answered all questions perfectly. You have successfully unlocked the <strong>Unit Test</strong> down below!
                                        </p>
                                        <div className="flex gap-2 justify-center pt-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setQuizSelectedOption(null);
                                              setQuizSubmitted(false);
                                              setQuizFeedback(null);
                                              setQuizQuestionIndex(0);
                                              setQuizCorrectCount(0);
                                              setQuizPassed(true);
                                            }}
                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-3xs cursor-pointer font-sans"
                                          >
                                            Review Quiz
                                          </button>
                                          <a
                                            href="#nest-unit-test-card"
                                            className="px-4 py-1.5 bg-[#113f8c] hover:bg-[#1a4ea3] text-white rounded-lg text-xs font-semibold shadow-3xs cursor-pointer font-sans"
                                          >
                                            Go to Unit Test
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto border-2 border-white shadow-xs">
                                          <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <h5 className="text-sm font-bold text-amber-800">Mastery Almost Attained!</h5>
                                        <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                                          You scored <strong>{quizCorrectCount} of {selectedChallenge.quiz.length}</strong> correct. Socratic Khan Path requires a 100% correct score to complete this concept quiz!
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setQuizSelectedOption(null);
                                            setQuizSubmitted(false);
                                            setQuizFeedback(null);
                                            setQuizQuestionIndex(0);
                                            setQuizCorrectCount(0);
                                            setQuizPassed(false);
                                          }}
                                          className="mt-2 px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold shadow-3xs cursor-pointer flex items-center gap-1.5 mx-auto font-sans"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" />
                                          <span>Retry Assessment</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                              </div>
                            )}
                          </div>

                          {/* CARD E: DYNAMIC UNIT TEST (WITH CUTE SVG CHARACTER) */}
                          <div className="bg-white border border-[#e7e5e0] rounded-xl p-6 shadow-xs space-y-4" id="nest-unit-test-card">
                            <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
                              <div>
                                <span className="text-[10px] font-mono tracking-widest text-emerald-700 font-bold uppercase flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mastery Unit Test (Section 4 of 4)</span>
                                </span>
                                <h4 className="text-base font-serif text-stone-900 mt-1">Compiling Edge Cases Unit Test</h4>
                              </div>
                              <span className="text-xs font-mono text-stone-400">Award: +1,000 XP</span>
                            </div>

                            {/* Wide Card Layout with Custom SVG Illustration from Screenshot */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl border border-emerald-200/50 p-5 md:p-6 items-center">
                              
                              {/* Left Column: Cute Green Block Character with Crown holding flag */}
                              <div className="md:col-span-4 flex justify-center">
                                <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-28 md:h-28 drop-shadow-md select-none">
                                  {/* Legs */}
                                  <line x1="45" y1="90" x2="45" y2="105" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
                                  <line x1="75" y1="90" x2="75" y2="105" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
                                  <ellipse cx="45" cy="106" rx="6" ry="3" fill="#047857" />
                                  <ellipse cx="75" cy="106" rx="6" ry="3" fill="#047857" />

                                  {/* Body block (green rounded rect) */}
                                  <rect x="30" y="40" width="60" height="52" rx="12" fill="#10b981" stroke="#059669" strokeWidth="3" />
                                  
                                  {/* Tummy highlight */}
                                  <rect x="42" y="65" width="36" height="20" rx="6" fill="#a7f3d0" />

                                  {/* Cute Face (Big friendly eyes) */}
                                  <circle cx="48" cy="56" r="5" fill="#111827" />
                                  <circle cx="72" cy="56" r="5" fill="#111827" />
                                  {/* Eye highlights */}
                                  <circle cx="46" cy="54" r="1.5" fill="#ffffff" />
                                  <circle cx="70" cy="54" r="1.5" fill="#ffffff" />
                                  
                                  {/* Rosy Cheeks */}
                                  <ellipse cx="40" cy="61" rx="3.5" ry="2" fill="#f43f5e" opacity="0.6" />
                                  <ellipse cx="80" cy="61" rx="3.5" ry="2" fill="#f43f5e" opacity="0.6" />

                                  {/* Smiling Mouth */}
                                  <path d="M 54 62 Q 60 67 66 62" stroke="#111827" strokeWidth="2" strokeLinecap="round" fill="none" />

                                  {/* Crown of Socratic Mastery */}
                                  <polygon points="40,41 45,26 53,35 60,23 67,35 75,26 80,41" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                                  {/* Jewels on crown */}
                                  <circle cx="45" cy="25" r="2" fill="#ef4444" />
                                  <circle cx="60" cy="22" r="2" fill="#3b82f6" />
                                  <circle cx="75" cy="25" r="2" fill="#ef4444" />

                                  {/* Left hand holding flag */}
                                  <path d="M 30 65 L 15 50" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
                                  {/* Flag Staff */}
                                  <line x1="15" y1="20" x2="15" y2="100" stroke="#78350f" strokeWidth="2.5" />
                                  {/* Flag banner (Socratic seal) */}
                                  <polygon points="15,20 15,48 5,34" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
                                  <polygon points="15,20 15,48 40,34" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="1" />
                                  <circle cx="23" cy="34" r="3" fill="#fbbf24" />

                                  {/* Right hand waving */}
                                  <path d="M 90 65 Q 105 55 100 45" stroke="#059669" strokeWidth="4" strokeLinecap="round" fill="none" />
                                </svg>
                              </div>

                              {/* Right Column: Narrative & Action triggers */}
                              <div className="md:col-span-8 space-y-3">
                                <h5 className="text-sm font-bold text-emerald-950 font-sans">
                                  The Socratic Unit Test Certification
                                </h5>
                                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                                  Before you officially lock in your complete mastery of <strong>{selectedChallenge.name}</strong>, let's run your code through our airgapped compiler, testing boundary conditions and algorithmic efficiency.
                                </p>

                                <div className="space-y-1 bg-white/70 backdrop-blur-xs p-3 rounded-lg border border-emerald-200/50 text-[11px] font-mono text-stone-700">
                                  <div className="flex items-center gap-1.5">
                                    <span className={quizPassed ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                                      {quizPassed ? "✓ Quiz Passed (100%)" : "✗ Quiz Unfinished or Needs Review"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span>• Time Complexity Guard: {selectedChallenge.optimalComplexity}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span>• Space Complexity Guard: Dynamic heap boundary checks</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <button
                                    type="button"
                                    disabled={!quizPassed || isSimulatingTest || testSuccess}
                                    onClick={() => {
                                      setIsSimulatingTest(true);
                                      setTimeout(() => {
                                        setIsSimulatingTest(false);
                                        setTestSuccess(true);
                                        // Award completing the challenge!
                                        if (!profile.completedIds.includes(selectedChallenge.id)) {
                                          updateProfile({ 
                                            completedIds: [...profile.completedIds, selectedChallenge.id],
                                            streak: profile.streak + 1
                                          });
                                        }
                                      }, 2200);
                                    }}
                                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-40 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 font-sans"
                                  >
                                    {isSimulatingTest ? (
                                      <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Compiling & Validating...</span>
                                      </>
                                    ) : testSuccess || profile.completedIds.includes(selectedChallenge.id) ? (
                                      <span>Mastery Certified ✓</span>
                                    ) : (
                                      <span>Run Unit Test & Certify Mastery</span>
                                    )}
                                  </button>

                                  {(testSuccess || profile.completedIds.includes(selectedChallenge.id)) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsStudyingActiveLesson(false);
                                        setQuizSelectedOption(null);
                                        setQuizSubmitted(false);
                                        setQuizFeedback(null);
                                        setTestSuccess(false);
                                      }}
                                      className="px-4 py-2 text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-all cursor-pointer shadow-3xs font-sans"
                                    >
                                      Return to Course Path
                                    </button>
                                  )}
                                </div>

                                {!quizPassed && (
                                  <p className="text-[10px] text-amber-800 font-sans leading-snug">
                                    ⚠️ Note: You must answer all questions correctly on the Concept Assessment Quiz above to unlock and run the Socratic Unit Test!
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Compile Success Confetti banner */}
                            {(testSuccess && quizPassed) && (
                              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-center space-y-2 animate-fade-in">
                                <span className="text-xl">🎉 ✨ 🎓 👑</span>
                                <h5 className="text-sm font-bold text-emerald-800 font-display">CONGRATULATIONS, SOCRATIC HERO!</h5>
                                <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto font-sans">
                                  Your code successfully passed all edge-condition evaluations with 100% computational efficiency! You collected <strong>+1,000 XP</strong> and advanced your study streak to <strong>{profile.streak} days</strong>!
                                </p>
                              </div>
                            )}

                          </div>

                        </div>

                        {/* Right Sidebar - Study Hints & AI Tutor Drawer Reminders (4/12 Columns) */}
                        <div className="lg:col-span-4 space-y-6">
                          
                          {/* Socratic Sizing Tutor Card */}
                          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 shadow-3xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                              <MessageSquare className="w-4 h-4 text-amber-600" />
                              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest font-mono">
                                Socratic Tutor Sidebar
                              </h4>
                            </div>

                            <p className="text-xs text-stone-700 leading-relaxed font-sans">
                              Need help formulating your answers, tracing stack pointers, or implementing the code? 
                            </p>

                            <div className="p-3 bg-white border border-amber-100 rounded-lg space-y-2 text-xs text-stone-600 font-sans">
                              <span className="font-bold text-amber-800 block">Socratic Interaction Keys:</span>
                              <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-stone-500">
                                <li>Click the **Chatbot** tab button at the top of your screen to expand/collapse your personal AI mentor sidebar!</li>
                                <li>Ask questions like: *&ldquo;Why is the complement necessary?&rdquo;* or *&ldquo;What does LIFO stand for?&rdquo;*</li>
                                <li>Your tutor will guide you with helpful questions instead of giving away raw copy-paste answers!</li>
                              </ul>
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsTutorCollapsed(false)}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 font-sans"
                            >
                              <MessageSquare className="w-4 h-4 text-stone-950" />
                              <span>Open Socratic Chatbot Sidebar</span>
                            </button>
                          </div>

                          {/* Unit Cheat-Sheet / Guide */}
                          <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-3">
                            <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase tracking-wider">Lesson Quick Facts:</span>
                            <div className="space-y-2 text-xs text-stone-600 font-sans">
                              <div className="flex justify-between border-b border-stone-50 py-1">
                                <span className="text-stone-400 font-mono">Topic:</span>
                                <span className="font-semibold text-stone-800">{selectedChallenge.name}</span>
                              </div>
                              <div className="flex justify-between border-b border-stone-50 py-1">
                                <span className="text-stone-400 font-mono">Prerequisite:</span>
                                <span className="font-semibold text-stone-800">Arrays & Stack memory</span>
                              </div>
                              <div className="flex justify-between border-b border-stone-50 py-1">
                                <span className="text-stone-400 font-mono">Target Big-O:</span>
                                <span className="font-semibold text-emerald-700 font-mono text-[11px]">{selectedChallenge.optimalComplexity}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* ======================================= */}
              {/* TAB 3: BROWSE LESSONS (MARKETPLACE)     */}
              {/* ======================================= */}
              {nestActiveTab === "browse" && (
                <div className="space-y-6 animate-fade-in" id="browse-tab-content">
                  
                  {/* SEARCH AND TITLE HEADER */}
                  <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-stone-900 font-display uppercase tracking-wide flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#113f8c]" />
                        <span>Socratic Lesson Marketplace</span>
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Explore, search, and enroll in dynamic custom curricula curated by Socratic Mentors. Request custom topics to study any algorithmic challenge!
                      </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-xs text-stone-800 outline-none focus:bg-white focus:border-[#113f8c] transition-all"
                          placeholder="Search marketplace algorithms or key concepts (e.g. stack, hashing)..."
                          value={marketplaceSearch}
                          onChange={(e) => setMarketplaceSearch(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-stone-400 mr-1 hidden md:inline">Filters:</span>
                        {["All", "Easy", "Medium", "Hard"].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => {
                              if (lvl === "All") {
                                setSearchQuery("");
                              } else {
                                setSearchQuery(lvl);
                              }
                            }}
                            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer font-medium ${
                              (lvl === "All" && searchQuery === "") || searchQuery === lvl
                                ? "bg-[#113f8c] text-white border-transparent"
                                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* LESSONS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {challenges
                      .filter(c => {
                        const matchesSearch = c.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) || 
                                              c.description.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                                              (c.teachingMaterials?.keyConcepts.some(concept => concept.toLowerCase().includes(marketplaceSearch.toLowerCase())) ?? false);
                        const matchesDifficulty = searchQuery === "" || c.difficulty === searchQuery;
                        return matchesSearch && matchesDifficulty;
                      })
                      .map((c) => {
                        const isCompleted = profile.completedIds.includes(c.id);
                        const isEnrolled = c.enrolled;
                        
                        return (
                          <div 
                            key={c.id} 
                            className="bg-white border border-[#e7e5e0] rounded-xl p-4 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-mono uppercase ${
                                  c.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" :
                                  c.difficulty === "Medium" ? "bg-amber-50 text-amber-700" :
                                  "bg-rose-50 text-rose-700"
                                }`}>
                                  {c.difficulty}
                                </span>

                                {isCompleted ? (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                    <Check className="w-3.5 h-3.5" /> Mastered
                                  </span>
                                ) : isEnrolled ? (
                                  <span className="text-[10px] text-blue-500 font-bold">
                                    Enrolled
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-stone-400">
                                    Not Enrolled
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="text-base font-bold text-stone-900 font-display leading-tight">{c.name}</h4>
                                <p className="text-[11px] font-mono text-stone-400 mt-0.5">{c.optimalComplexity}</p>
                              </div>

                              <p className="text-xs text-stone-600 line-clamp-3">
                                {c.description}
                              </p>

                              {/* Highlight some core concepts */}
                              <div className="pt-2 flex flex-wrap gap-1">
                                {c.teachingMaterials?.keyConcepts.slice(0, 2).map((concept, sIdx) => (
                                  <span key={sIdx} className="text-[9px] bg-stone-50 border border-stone-200/50 rounded-sm px-1.5 py-0.5 text-stone-500 font-mono max-w-full truncate">
                                    {concept.split(":")[0]}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                              {isCompleted ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectChallenge(c);
                                    setNestActiveTab("lessons");
                                  }}
                                  className="w-full py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                                >
                                  <span>Review Material</span>
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              ) : isEnrolled ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectChallenge(c);
                                    setNestActiveTab("lessons");
                                  }}
                                  className="w-full py-1.5 text-xs font-semibold bg-[#113f8c] text-white rounded-lg hover:bg-[#1a4ea3] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-3xs font-sans"
                                >
                                  <span>Resume Study</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedChallenges = challenges.map(chal => {
                                      if (chal.id === c.id) return { ...chal, enrolled: true };
                                      return chal;
                                    });
                                    setChallenges(updatedChallenges);
                                    // Set challenge as enrolled and start studying
                                    handleSelectChallenge({ ...c, enrolled: true });
                                    setNestActiveTab("lessons");
                                  }}
                                  className="w-full py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-3xs font-sans"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Enroll & Study</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* DEDICATED OPTION TO REQUEST LESSONS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    
                    {/* Curriculum request form */}
                    <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4 lg:col-span-1">
                      <div className="border-b border-stone-100 pb-2">
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-[#113f8c]" />
                          <span>Request Dynamic Curriculum</span>
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">Need a specific algorithm? Tell us what you want to study!</p>
                      </div>

                      {showRequestSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 animate-fade-in">
                          Your request is submitted successfully! Our mentors are curating the interactive slides.
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-stone-500 block uppercase">Topic / Algorithm Name</label>
                          <input
                            type="text"
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 outline-none focus:bg-white focus:border-[#113f8c] transition-colors"
                            placeholder="e.g. Merge Sort, LRU Cache..."
                            value={requestTopic}
                            onChange={(e) => setRequestTopic(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-stone-500 block uppercase">Expected Difficulty</label>
                          <select
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 outline-none focus:bg-white focus:border-[#113f8c] transition-colors"
                            value={requestDifficulty}
                            onChange={(e) => setRequestDifficulty(e.target.value as any)}
                          >
                            <option value="Easy">Easy (Apprentice)</option>
                            <option value="Medium">Medium (Scholar)</option>
                            <option value="Hard">Hard (Expert)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-stone-500 block uppercase">Why do you want to master this?</label>
                          <textarea
                            rows={3}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 outline-none focus:bg-white focus:border-[#113f8c] transition-colors resize-none text-[12px]"
                            placeholder="Explain your learning objective..."
                            value={requestRationale}
                            onChange={(e) => setRequestRationale(e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          disabled={!requestTopic.trim() || !requestRationale.trim()}
                          onClick={() => {
                            if (!requestTopic.trim() || !requestRationale.trim()) return;
                            const newRequest = {
                              topic: requestTopic.trim(),
                              difficulty: requestDifficulty,
                              rationale: requestRationale.trim(),
                              date: new Date().toLocaleDateString()
                            };
                            setRequestedLessons([newRequest, ...requestedLessons]);
                            setRequestTopic("");
                            setRequestRationale("");
                            setShowRequestSuccess(true);
                            setTimeout(() => setShowRequestSuccess(false), 5000);
                          }}
                          className="w-full py-2 bg-[#113f8c] text-white font-semibold text-xs rounded-lg hover:bg-[#1a4ea3] active:scale-98 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer shadow-3xs font-sans"
                        >
                          Submit Request
                        </button>
                      </div>
                    </div>

                    {/* Request history log */}
                    <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 shadow-xs space-y-4 lg:col-span-2">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-amber-500" />
                          <span>Classroom Curriculums Requested</span>
                        </h4>
                        <span className="text-[10px] font-mono text-stone-400">Total: {requestedLessons.length}</span>
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {requestedLessons.length === 0 ? (
                          <div className="text-center py-10 text-stone-400 text-xs italic bg-stone-50/50 rounded-lg border border-dashed border-stone-200">
                            No requests submitted yet. Use the left form to add your first desired custom algorithm!
                          </div>
                        ) : (
                          requestedLessons.map((req, idx) => (
                            <div key={idx} className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in text-left">
                              <div className="space-y-1">
                                <h5 className="text-sm font-bold text-stone-800 font-serif">{req.topic}</h5>
                                <p className="text-xs text-stone-500 font-light">&ldquo;{req.rationale}&rdquo;</p>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400 pt-1">
                                  <span>Requested: {req.date}</span>
                                  <span>•</span>
                                  <span className={`font-semibold ${
                                    req.difficulty === "Easy" ? "text-emerald-600" :
                                    req.difficulty === "Medium" ? "text-amber-600" :
                                    "text-rose-600"
                                  }`}>{req.difficulty}</span>
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-[10px] font-medium text-amber-800 px-2 py-0.5 rounded-full font-mono leading-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                  Curating...
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Socratic Assist Chatbox box — Socratic Mentor Companion */}
            <div className={`relative flex flex-col bg-white border-l border-[#e7e5e0] transition-all duration-300 ${
              isTutorCollapsed ? "w-0 lg:w-12" : "w-full lg:w-[380px] shrink-0"
            }`} id="nest-socratic-chat-rail">
              
              {/* Vertical Collapse trigger ribbon badge */}
              <button
                type="button"
                onClick={() => setIsTutorCollapsed(prev => !prev)}
                className="absolute left-[-24px] top-6 w-6 h-12 bg-white border border-[#e7e5e0] border-r-0 rounded-l-md flex items-center justify-center text-stone-500 hover:text-[#113f8c] hover:bg-stone-50 focus:outline-none shadow shadow-stone-200 cursor-pointer z-10"
                title={isTutorCollapsed ? "Show Tutor Chatbot" : "Hide Tutor Chatbot"}
              >
                {isTutorCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {isTutorCollapsed ? (
                // Collapsed miniature sidebar indicator
                <div className="flex-1 flex flex-col items-center py-8 space-y-6 text-stone-400 cursor-pointer" onClick={() => setIsTutorCollapsed(false)}>
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span className="font-mono text-[9px] uppercase tracking-widest font-extrabold rotate-90 origin-top-left translate-x-3.5 pt-8 whitespace-nowrap text-stone-600">
                    Socratic Guide
                  </span>
                </div>
              ) : (
                // FULL EXPANDED SOCRATIC INTERACTIVE CHATBOX
                <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
                  
                  {/* Header block for tutor chat with avatar */}
                  <div className="p-4 border-b border-[#e7e5e0] bg-[#faf9f6]/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 border-2 border-white shadow-sm">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-stone-900 font-display uppercase tracking-wider">Socratic Helper</h5>
                        <p className="text-[10px] text-stone-500">Mentoring Assistant • Online</p>
                      </div>
                    </div>
                    
                    <span className="p-1 px-2 bg-[#113f8c]/10 rounded-md text-[9px] uppercase font-mono font-bold text-[#113f8c] select-none border border-[#113f8c]/25">
                      Whiteboard
                    </span>
                  </div>

                  {/* Socratic response history stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {socraticHistory.map((m) => (
                      <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <span className="text-[9px] font-mono text-stone-400 mb-1">
                          {m.role === "user" ? profile.name : "Socratic Assistant"}
                        </span>
                        <div className={`p-3 rounded-lg max-w-[85%] text-xs leading-relaxed ${
                          m.role === "user"
                            ? "bg-[#113f8c] text-white shadow-3xs"
                            : "bg-stone-50 text-stone-800 border border-[#e7e5e0]"
                        }`}>
                          {m.content.split("\n").map((line, idx) => (
                            <p key={idx} className="mb-1 last:mb-0">
                              {m.id === "soc-init"
                                ? line.replace("Hello student!", `Hello ${profile.name.split(" ")[0]}!`)
                                : line
                              }
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}

                    {isSocraticLoading && (
                      <div className="flex flex-col items-start animate-pulse">
                        <span className="text-[9px] font-mono text-[#113f8c] mb-1 font-bold">Assistant is composing guide question...</span>
                        <div className="bg-stone-50 p-3 rounded-lg border border-[#e7e5e0] text-xs text-stone-500">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student workspace personal thoughts pad */}
                  <div className="p-3 bg-stone-50 border-t border-b border-[#e7e5e0] space-y-1.5 font-mono">
                    <span className="text-[9px] text-[#113f8c] font-bold block uppercase tracking-wider">Student Scratchpad Notes:</span>
                    <input 
                      type="text"
                      className="w-full bg-white border border-[#e7e5e0] rounded px-2.5 py-1.5 text-xs text-stone-700 outline-none focus:border-[#113f8c]"
                      value={sandboxNotes}
                      onChange={(e) => setSandboxNotes(e.target.value)}
                      placeholder="Describe line or variables logic..."
                    />
                  </div>

                  {/* Question Input Block */}
                  <div className="p-3 bg-white border-t border-[#e7e5e0] flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800 placeholder-stone-400 outline-none focus:bg-white focus:border-[#113f8c] transition-colors"
                      placeholder="Ask hints or about boundary behaviors..."
                      value={socraticInput}
                      onChange={(e) => setSocraticInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendSocratic();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSendSocratic}
                      className="p-2.5 bg-[#113f8c] text-white hover:bg-[#1a4ea3] rounded-lg transition-colors flex items-center justify-center font-bold shadow-xs cursor-pointer animate-fade-in"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* VIEW C: COUCOU LOCAL COMPANION PORTAL — PERFECT GEMINI DUPLICATE CLIENT */}
      {currentPortal === "coucou" && (
        <main className="flex-1 flex overflow-hidden bg-white" id="coucou-companion-grid">
          
          {/* SIDEBAR: Google Gemini Chat History & Option Control Panel */}
          <aside className={`bg-stone-50 border-r border-[#e7e5e0] flex flex-col transition-all duration-300 shrink-0 select-none ${
            isSidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"
          }`} id="coucou-sidebar">
            
            {/* New Chat Button Row */}
            <div className="p-3 pb-0">
              <button
                type="button"
                onClick={handleCreateNewChat}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold bg-[#113f8c]/5 hover:bg-[#113f8c]/10 text-[#113f8c] border border-[#113f8c]/15 transition-all rounded-lg text-left shadow-2xs leading-none cursor-pointer"
                id="new-chat-sidebar-btn"
              >
                <span className="text-sm font-bold">+</span>
                <span>New chat</span>
              </button>
            </div>

            {/* Central Part: Chat History Saved Sessions list */}
            <div className="flex-1 py-4 overflow-y-auto px-2 space-y-1">
              <div className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                Recent Chats
              </div>
              
              {sessions.map((item) => {
                const isActive = item.id === activeSessionId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveSessionId(item.id)}
                    className={`group w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-all ${
                      isActive 
                        ? "bg-slate-100 text-[#113f8c] font-semibold" 
                        : "text-stone-700 hover:bg-stone-100/80"
                    }`}
                  >
                    <div className="flex items-center min-w-0 pr-1 select-none">
                      <span className="truncate block text-left" title={item.title}>
                        {item.title || "Empty prompt session"}
                      </span>
                    </div>

                    {/* Delete session button hover block */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(item.id, e)}
                      className="p-1 px-2 text-stone-400 hover:text-rose-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 cursor-pointer font-bold text-sm"
                      title="Delete chat session"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Section: Hardware Specs monitor & settings togglers */}
            <div className="p-3.5 border-t border-[#e7e5e0] bg-[#fbfbfa] space-y-3">
              
              {/* Minimal Hardware allocated load widget */}
              <div className="bg-white border border-[#e7e5e0] p-3 rounded-lg space-y-2 text-[10px] font-mono text-stone-500 shadow-3xs">
                <div className="flex items-center justify-between text-stone-600 font-bold font-sans">
                  <span>Local Engine Load</span>
                  <span className="text-emerald-600">Active</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between select-none">
                    <span>CPU Threads</span>
                    <span className="font-semibold text-stone-700">{cpuLoad}% / 8 Cores</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#113f8c] h-full transition-all duration-300" 
                      style={{ width: `${cpuLoad}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between select-none">
                    <span>VRAM / RAM</span>
                    <span className="font-semibold text-stone-700">{ramUsed} GB / 16 GB</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full transition-all duration-300" 
                      style={{ width: `${(ramUsed/16)*100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons list */}
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab("models");
                    setShowSettings(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
                  id="settings-trigger-btn"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Settings className="w-4 h-4 text-stone-500" /> Settings
                  </span>
                </button>
                <div className="flex items-center gap-2 px-3 py-1 bg-stone-100/60 rounded-lg select-none border border-stone-200/50">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-[11px] font-semibold text-stone-800 tracking-tight truncate">
                    {profile.name}
                  </span>
                </div>
              </div>
            </div>

          </aside>

          {/* MAIN COMPANION INTERACTION WINDOW */}
          <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden" id="coucou-chat-stage">
            
            {/* Core Header with Model pill trigger & sidebar control */}
            <div className="h-14 border-b border-[#e7e5e0] px-4 flex items-center justify-between bg-white/95 backdrop-blur-md z-10 shrink-0">
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(prev => !prev)}
                  className="p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors cursor-pointer flex items-center justify-center font-mono font-bold text-xs"
                  title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                  id="collapse-sidebar-btn"
                >
                  {isSidebarCollapsed ? "→" : "←"}
                </button>

                {/* CUSTOM GEMINI-STYLE MODEL DROPDOWN ACCORDION BUTTON */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown(prev => !prev)}
                    className="flex items-center gap-2 px-3.5 py-1.5 hover:bg-stone-100 border border-stone-200/80 rounded-full text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
                    id="model-selector-pill-btn"
                  >
                    <span>{models.find(m => m.id === activeModelId)?.name || "Gemini 3.5 Flash"}</span>
                    <span className="text-[10px] text-stone-400 font-normal">({models.find(m => m.id === activeModelId)?.size})</span>
                    <span className="text-[10px] text-stone-550 inline-block">▾</span>
                  </button>

                  {/* Dropdown Options Popup */}
                  {showModelDropdown && (
                    <div className="absolute left-0 mt-2 w-72 bg-white border border-stone-200 rounded-xl shadow-lg z-40 overflow-hidden animate-fade-in">
                      <div className="p-2 bg-stone-50 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-3.5">
                        Active Sandbox Models
                      </div>
                      
                      <div className="py-1">
                        {models.map((m) => {
                          const isActiveModel = m.id === activeModelId;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setActiveModelId(m.id);
                                setShowModelDropdown(false);
                                // If model is not downloaded, offer instant redirect
                                if (!m.downloaded) {
                                  setSettingsTab("models");
                                  setShowSettings(true);
                                }
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-stone-50 flex items-start justify-between ${
                                isActiveModel ? "bg-stone-50 border-l-2 border-[#113f8c]" : ""
                              }`}
                            >
                              <div className="space-y-0.5 pr-2">
                                <p className={`font-semibold ${isActiveModel ? "text-[#113f8c]" : "text-stone-900"}`}>{m.name}</p>
                                <p className="text-[10px] text-stone-500 line-clamp-1">{m.description}</p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono text-stone-400 block">{m.size}</span>
                                {m.downloaded ? (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">Ready</span>
                                ) : (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-100">Uncached</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-2 bg-stone-50 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModelDropdown(false);
                            setSettingsTab("models");
                            setShowSettings(true);
                          }}
                          className="w-full text-center text-[11px] text-[#113f8c] font-semibold hover:underline block py-1"
                        >
                          Manage Local Models & Depot
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Options inside chat stage */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab("advanced");
                    setShowSettings(true);
                  }}
                  className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors border border-stone-200 text-[11px] font-semibold cursor-pointer"
                  title="Configure advanced logic rules"
                >
                  Tune
                </button>
                <span className="text-[11px] text-stone-400 font-mono hidden sm:inline select-none">
                  Temp: {temperature} • Tokens: {maxTokens}
                </span>
              </div>
            </div>

            {/* CHAT CHANNELS PORTAL CONTEXT */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col justify-between" id="coucou-chat-scroller">
              
              {activeChatSession.messages && activeChatSession.messages.length > 0 ? (
                // NORMAL MESSAGE STREAM OR CHAT FEED
                <div className="space-y-6 max-w-3xl mx-auto w-full pb-10">
                  {activeChatSession.messages.map((m) => {
                    const isUser = m.role === "user";
                    return (
                      <div 
                        key={m.id} 
                        className={`flex gap-4 p-4 rounded-xl transition-colors ${
                          isUser ? "bg-stone-50 border border-stone-100" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div className="shrink-0 pt-0.5">
                          {isUser ? (
                            <div className="w-8 h-8 rounded-full bg-[#113f8c]/10 text-[#113f8c] flex items-center justify-center font-bold text-xs select-none shadow-3xs">
                              AR
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#113f8c] flex items-center justify-center font-bold text-[10px] select-none shadow-3xs">
                              CC
                            </div>
                          )}
                        </div>

                        {/* Content text block with code formatting helper */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <p className="text-[10px] font-sans font-bold text-stone-400 select-none">
                            {isUser ? profile.name : models.find(m => m.id === activeModelId)?.name || "Coucou Bot"}
                          </p>
                          
                          <div className="text-stone-800 text-sm leading-relaxed space-y-2 whitespace-pre-wrap">
                            {m.content.includes("```") ? (
                              // Beautifully structure inline formatting segments
                              m.content.split("```").map((chunk, itemIdx) => {
                                const isCodeSegment = itemIdx % 2 !== 0;
                                if (isCodeSegment) {
                                  // Find typescript, javascript or general tags
                                  const index = chunk.indexOf("\n");
                                  const code = index !== -1 ? chunk.substring(index + 1) : chunk;
                                  return (
                                    <div key={itemIdx} className="my-2 border border-stone-200 rounded-lg overflow-hidden shadow-3xs font-mono text-xs">
                                      <div className="bg-stone-100/80 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-stone-500 font-sans font-bold text-[10px]">
                                        <span>MUTABLE CODE INTERNALS</span>
                                        <button
                                          type="button"
                                          onClick={() => copyToClipboard(code)}
                                          className="text-[#113f8c] hover:underline hover:text-blue-900 leading-none cursor-pointer"
                                        >
                                          Copy Code
                                        </button>
                                      </div>
                                      <pre className="p-3 bg-stone-50 overflow-x-auto text-emerald-800 text-[11.5px] leading-relaxed select-text">{code}</pre>
                                    </div>
                                  );
                                }
                                return chunk;
                              })
                            ) : (
                              m.content
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing loader */}
                  {isCompanionLoading && (
                    <div className="flex gap-4 p-4 animate-pulse">
                      <div className="shrink-0">
                        <div className="w-8 h-8 rounded-full bg-stone-200 animate-spin"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-stone-200 rounded-md w-1/3"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-stone-100 rounded-md w-full"></div>
                          <div className="h-3 bg-stone-100 rounded-md w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // NORMAL WELCOME PAGE IN GEMINI DESIGN
                <div className="max-w-2xl mx-auto w-full my-auto py-12 px-4 space-y-12 animate-fade-in" id="coucou-welcome-screen">
                  
                  {/* Dynamic greeting title utilizing sleek light mode visual gradients */}
                  <div className="space-y-2.5 text-left">
                    <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight bg-gradient-to-r from-[#113f8c] via-blue-600 to-amber-700 bg-clip-text text-transparent leading-none">
                      Hello, {profile.name.split(" ")[0]}.
                    </h1>
                    <p className="text-2xl md:text-3xl text-stone-400 font-display font-medium tracking-tight">
                      How can I help you program today?
                    </p>
                  </div>

                  {/* Suggestion prompt templates ready-to-click */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PROMPT_SUGGESTIONS.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSendCompanion(s.prompt)}
                        className="p-4 bg-stone-50 border border-stone-200/80 hover:bg-stone-100/60 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 group text-left relative flex flex-col justify-between h-28 hover:shadow-2xs"
                      >
                        <div className="space-y-1">
                          <h6 className="text-xs font-bold text-stone-900 group-hover:text-[#113f8c] transition-colors">{s.title}</h6>
                          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed font-light">{s.subtitle}</p>
                        </div>
                        <div className="flex justify-end pt-1">
                          <span className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#113f8c] group-hover:text-white transition-all shadow-3xs font-bold text-xs select-none">
                            →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Sticky Input Frame bar */}
              <div className="max-w-3xl mx-auto w-full pt-4 shrink-0 bg-white">
                <div className="relative">
                  <div className="border border-stone-200 rounded-2xl bg-stone-50 focus-within:bg-white focus-within:shadow-md focus-within:border-[#113f8c] transition-all flex items-end p-1.5 shadow-3xs">
                    
                    {/* Inline placeholder or parameter badge */}
                    <textarea
                      rows={1}
                      className="flex-1 bg-transparent px-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none resize-none max-h-48 leading-relaxed font-sans"
                      placeholder={`Ask ${models.find(m => m.id === activeModelId)?.name || "Gemini"} anything...`}
                      value={companionInput}
                      onChange={(e) => setCompanionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendCompanion();
                        }
                      }}
                    />

                    {/* Dynamic colored send trigger inside pill box */}
                    <button
                      type="button"
                      disabled={!companionInput.trim() || isCompanionLoading}
                      onClick={() => handleSendCompanion()}
                      className={`px-4 py-2 rounded-xl transition-all flex items-center justify-center shadow-3xs cursor-pointer text-xs font-bold leading-none ${
                        companionInput.trim() 
                          ? "bg-[#113f8c] text-white hover:bg-blue-800"
                          : "bg-stone-100 text-stone-300 pointer-events-none border border-stone-200/50"
                      }`}
                      title="Send message"
                      id="send-companion-msg-btn"
                    >
                      Send
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-center text-stone-400 py-3 font-sans select-none tracking-tight">
                  Our offline-first models run safely on device resources. Powered by local AI compiler nodes. Gemini v3.5 fallback enabled.
                </p>
              </div>

            </div>

          </div>

        </main>
      )}

      {/* HARDWARE/MODEL SETTINGS MODAL DIALOG DRAWBACK (Khan Customizer & Model Depot) */}
      {showSettings && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="settings-modal-overlay">
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
            
            {/* Header portion */}
            <div className="p-4 border-b border-[#e7e5e0] bg-[#faf9f6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#113f8c]" />
                <div>
                  <h4 className="text-base font-bold text-stone-900">System Control Centre</h4>
                  <p className="text-xs text-stone-500">Configure language weights, hardware allocations and profile details</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1 px-3 bg-stone-100 hover:bg-stone-200/60 rounded-lg text-stone-600 font-bold text-xs border border-stone-200 cursor-pointer"
                id="close-settings-modal-btn"
              >
                Close
              </button>
            </div>

            {/* Selector Tab Layout Row */}
            <div className="flex border-b border-stone-100 bg-stone-50 select-none">
              <button
                type="button"
                onClick={() => setSettingsTab("models")}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  settingsTab === "models" ? "border-[#113f8c] text-[#113f8c]" : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
                id="settings-models-tab"
              >
                📦 Local Model Depot
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("profile")}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  settingsTab === "profile" ? "border-[#113f8c] text-[#113f8c]" : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
                id="settings-profile-tab"
              >
                👤 Student Profile
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("advanced")}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  settingsTab === "advanced" ? "border-[#113f8c] text-[#113f8c]" : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
                id="settings-advanced-tab"
              >
                ⚙️ Instruction Heuristics
              </button>
            </div>

            {/* Main dialog section content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* TAB 1: MODEL DEPOT OR DOWNLOADER */}
              {settingsTab === "models" && (
                <div className="space-y-4">
                  
                  {/* System allocation metrics cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 select-none">
                    <div className="p-3 border border-stone-200 bg-[#faf9f6]/50 rounded-xl space-y-1">
                      <span className="text-[10px] text-stone-400 font-mono tracking-wider font-extrabold block">GPU MEMORY BUFFER TARGETS</span>
                      <p className="text-sm font-bold text-stone-800 flex items-center gap-1.5 font-sans">
                        <Laptop className="w-4 h-4 text-emerald-600" /> WebGL Metal Core API Acceleration
                      </p>
                      <p className="text-[11px] text-stone-500 italic font-mono">Compatible • Enabled on local sandbox</p>
                    </div>

                    <div className="p-3 border border-stone-200 bg-[#faf9f6]/50 rounded-xl space-y-1">
                      <span className="text-[10px] text-stone-400 font-mono tracking-wider font-extrabold block">RECOMMENDED LOCAL DEPLOYMENT</span>
                      <p className="text-sm font-bold text-stone-800 flex items-center gap-1.5 font-sans">
                        <Cpu className="w-4 h-4 text-[#113f8c]" /> Phi-3 Mini 3.8B Quantized
                      </p>
                      <p className="text-[11px] text-stone-500 italic font-mono">Quantization target fits typical browser RAM allowances</p>
                    </div>
                  </div>

                  {/* List of Models block */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-stone-900 block border-b border-stone-100 pb-1.5">Model Library Catalog</span>
                    
                    {models.map((m) => (
                      <div key={m.id} className="p-4 bg-white border border-stone-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-black text-stone-900 font-sans">{m.name}</h5>
                            <span className="text-[10px] font-mono text-stone-400">({m.size})</span>
                          </div>
                          <p className="text-[11px] text-stone-500 leading-relaxed font-light">{m.description}</p>
                          
                          {/* Live downloading phases indicators details block */}
                          {m.isDownloading && (
                            <div className="pt-2 text-[10px] font-mono text-[#113f8c] space-y-1 font-bold">
                              <span className="animate-pulse flex items-center gap-1 text-xs">
                                <RefreshCw className="w-3 h-3 text-[#113f8c] animate-spin" /> {m.compilingPhase}
                              </span>
                              <div className="flex justify-between font-normal text-stone-400 font-sans select-none">
                                <span>Speed: {m.downloadSpeed}</span>
                                <span>ETA: {m.eta}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2 text-right">
                          {m.downloaded ? (
                            <div className="space-y-1 text-center sm:text-right">
                              <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                                Cache Ready
                              </span>
                              {m.id !== "gemini-3.5" && m.id !== "phi-3" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setModels(prev => prev.map(old => old.id === m.id ? { ...old, downloaded: false, downloadProgress: 0, compilingPhase: "Not Downloaded" } : old));
                                  }}
                                  className="text-[10px] text-rose-600 block pl-2 hover:underline select-none block w-full text-center sm:text-right pt-0.5 cursor-pointer"
                                >
                                  Delete Cache
                                </button>
                              )}
                            </div>
                          ) : m.isDownloading ? (
                            <div className="w-28 text-center bg-stone-100 border border-stone-200 rounded-lg p-2.5 space-y-1 select-none">
                              <span className="text-[11px] font-bold text-indigo-700 block">{m.downloadProgress}%</span>
                              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${m.downloadProgress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => triggerModelDownload(m.id)}
                              className="text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/70 border border-stone-200/80 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" /> Download model
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 2: PROFILE EDITOR */}
              {settingsTab === "profile" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block">Student Academic Name:</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs text-stone-800 outline-none focus:border-[#113f8c]"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block">Personalized Academic Goal / Focus:</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs text-stone-800 outline-none focus:border-[#113f8c]"
                      value={profile.currentGoal}
                      onChange={(e) => setProfile(prev => ({ ...prev, currentGoal: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block">Study Role Title:</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs text-stone-800 outline-none focus:border-[#113f8c]"
                        value={profile.role}
                        onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-700 block">Practice Streak (Days):</label>
                      <input
                        type="number"
                        className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs text-stone-800 outline-none focus:border-[#113f8c]"
                        value={profile.streak}
                        onChange={(e) => setProfile(prev => ({ ...prev, streak: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block">Student Avatar Visual:</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { seed: "scholar", name: "Scholar" },
                        { seed: "coder", name: "Coder" },
                        { seed: "thinker", name: "Thinker" },
                        { seed: "explorer", name: "Explorer" },
                        { seed: "wizard", name: "Wizard" }
                      ].map((item) => {
                        const isActive = profile.avatarSeed === item.seed;
                        return (
                          <button
                            key={item.seed}
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, avatarSeed: item.seed }))}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              isActive 
                                ? "bg-stone-50 border-[#113f8c] ring-1 ring-[#113f8c]/20 shadow-3xs" 
                                : "bg-white border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                              {renderAvatarIcon(item.seed, "w-4 h-4")}
                            </div>
                            <span className="text-[9px] font-medium text-stone-500">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3 select-none">
                    <Award className="w-5 h-5 text-[#113f8c]" />
                    <span className="text-[11px] text-stone-600 leading-normal">
                      Updating profile parameters synchronizes stats blocks with the Whiteboard Nest scoreboards seamlessly!
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={profileSaving}
                      onClick={handleSaveSettingsProfile}
                      className="px-4 py-2 bg-[#113f8c] hover:bg-[#113f8c]/95 text-white rounded-lg text-xs font-bold transition-all disabled:bg-stone-400 cursor-pointer flex items-center gap-1 shadow-3xs"
                    >
                      {profileSaving ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Saving to Cloud...</span>
                        </>
                      ) : profileSaveSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Profile Saved!</span>
                        </>
                      ) : (
                        <span>Save Changes to Cloud</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM INSTRUCTIONS & TEMP LIMITS */}
              {settingsTab === "advanced" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block">Companion System Instructions Block:</label>
                    <textarea
                      rows={4}
                      className="w-full bg-white border border-stone-200 rounded-lg p-3 text-xs text-stone-800 outline-none focus:border-[#113f8c] leading-relaxed font-sans"
                      value={systemInstructionText}
                      onChange={(e) => setSystemInstructionText(e.target.value)}
                    />
                    <p className="text-[10px] text-stone-400 italic">This dictates the base persona prompt injected inside Gemini generative passes</p>
                  </div>

                  <div className="space-y-4 pt-1 select-none">
                    
                    {/* Temperature Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-stone-700">
                        <span>Generative Temperature</span>
                        <span className="font-mono text-[#113f8c] font-semibold">{temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        className="w-full hover:cursor-grab active:cursor-grabbing accent-[#113f8c]"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      />
                      <div className="flex justify-between text-[10px] text-stone-400">
                        <span>Precise & Analytical (0.1)</span>
                        <span>Creative & Experimental (1.0)</span>
                      </div>
                    </div>

                    {/* Max token limits slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-stone-700">
                        <span>Maximum Generative Output Length</span>
                        <span className="font-mono text-[#113f8c] font-semibold">{maxTokens} Tokens</span>
                      </div>
                      <input
                        type="range"
                        min="256"
                        max="4096"
                        step="256"
                        className="w-full hover:cursor-grab active:cursor-grabbing accent-[#113f8c]"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      />
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Modal actions footer */}
            <div className="p-4 border-t border-[#e7e5e0] bg-stone-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-xs font-semibold bg-[#113f8c] text-white px-5 py-2 hover:bg-[#1a4ea3] active:scale-98 transition-all rounded-lg shadow-sm cursor-pointer"
                id="save-settings-btn"
              >
                Apply configurations
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY: KHAN ACADEMY ACTIVE LECTURE POPUP (VIDEO & READING) */}
      {activeLecturePopup && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="active-lecture-overlay">
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#e7e5e0] bg-[#faf9f6]/95 flex items-center justify-between shadow-3xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#113f8c]" />
                <div className="text-left">
                  <h4 className="text-sm font-bold text-stone-900">{activeLecturePopup.title}</h4>
                  <p className="text-[10px] text-stone-500">Khan Academy Interactive Socratic Curriculum</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setActiveLecturePopup(null)}
                className="p-1 px-3 bg-stone-100 hover:bg-stone-200/60 rounded-md border border-stone-200 text-stone-600 font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            {/* Video Simulator Screen */}
            <div className="bg-[#0b1b3d] aspect-video relative flex flex-col justify-between p-4 text-white overflow-hidden select-none border-b border-stone-800 shrink-0">
              {/* Abstract decorative layout */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                  <path d="M0,50 Q25,20 50,50 T100,50" strokeWidth="0.5" strokeDasharray="2" />
                </svg>
              </div>

              {/* Video Title Indicator */}
              <div className="flex justify-between items-center z-10">
                <span className="text-[9px] bg-red-600 px-1.5 py-0.5 rounded-sm font-mono font-bold tracking-wider uppercase">● STREAMING HD</span>
                <span className="text-[10px] font-mono text-stone-400">Classroom Session #0{activeLecturePopup.id.charCodeAt(activeLecturePopup.id.length - 1) % 9 || 4}</span>
              </div>

              {/* Play symbol with orbital ring */}
              <div className="flex flex-col items-center justify-center space-y-3 z-10 py-4">
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg group">
                  <Play className="w-6 h-6 text-white fill-current translate-x-0.5 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-medium tracking-wide text-stone-200">Interactive Concept Demonstration</span>
                  <p className="text-[9px] text-stone-400 font-mono mt-0.5">Socratic Blackboard Sketch.mp4 (08:45)</p>
                </div>
              </div>

              {/* Video Controls Bar */}
              <div className="space-y-2 z-10 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-lg">
                {/* Timeline scrubber */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-stone-300">02:14</span>
                  <div className="flex-1 bg-white/20 h-1 rounded-full relative overflow-hidden">
                    <div className="bg-amber-400 h-full w-[25%] rounded-full"></div>
                  </div>
                  <span className="text-[9px] font-mono text-stone-400">08:45</span>
                </div>

                {/* Sub-buttons */}
                <div className="flex items-center justify-between text-stone-400 text-[10px] font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-white hover:text-amber-400 cursor-pointer">Play</span>
                    <span className="hover:text-white cursor-pointer">Mute</span>
                    <span className="hover:text-white cursor-pointer">CC [English]</span>
                  </div>
                  <span>1080p 60fps</span>
                </div>
              </div>
            </div>

            {/* Reading Material Content Pane */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
              <div className="prose prose-stone max-w-none text-xs text-stone-700 leading-relaxed font-sans space-y-3">
                {activeLecturePopup.content.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('###')) {
                    return <h3 key={pIdx} className="text-base font-bold text-stone-900 font-serif border-b border-stone-100 pb-1.5 pt-2">{paragraph.replace('###', '').trim()}</h3>;
                  }
                  if (paragraph.startsWith('####')) {
                    return <h4 key={pIdx} className="text-sm font-bold text-stone-800 font-sans pt-1">{paragraph.replace('####', '').trim()}</h4>;
                  }
                  if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                    return (
                      <ul key={pIdx} className="list-disc pl-5 space-y-1 text-stone-600 font-sans my-2">
                        {paragraph.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^[\-\*]\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.match(/^\d+\./)) {
                    return (
                      <ol key={pIdx} className="list-decimal pl-5 space-y-1 text-stone-600 font-sans my-2">
                        {paragraph.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^\d+\.\s+/, '')}</li>
                        ))}
                      </ol>
                    );
                  }
                  return <p key={pIdx}>{paragraph}</p>;
                })}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-[#e7e5e0] bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setIsTutorCollapsed(false); // Open chatbot sidebar
                  setActiveLecturePopup(null); // Close modal
                }}
                className="w-full sm:w-auto text-[11px] font-bold text-[#113f8c] border border-[#113f8c]/20 bg-white hover:bg-[#113f8c]/5 px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-3xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Socratic Tutor a Question</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setViewedLectures(prev => ({ ...prev, [activeLecturePopup.id]: true }));
                    setActiveLecturePopup(null);
                  }}
                  className="flex-1 sm:flex-none text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 transition-all rounded-lg shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark as Read & Completed</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY: ADAPTIVE KHAN ACADEMY STYLED BROWSE LESSONS DIALOGUE */}
      {showLessonSelector && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="lessons-selector-overlay">
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
            
            {/* Header */}
            <div className="p-4 border-b border-[#e7e5e0] bg-[#faf9f6]/95 flex items-center justify-between shadow-3xs">
              <div>
                <h4 className="text-base font-bold text-stone-900">Browse Algorithmic Lessons</h4>
                <p className="text-xs text-stone-500">Select any foundational core concept to master</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowLessonSelector(false)}
                className="p-1 px-3 bg-stone-100 hover:bg-stone-200/60 rounded-md border border-stone-200 text-stone-600 font-bold text-xs cursor-pointer"
                id="close-lessons-selector-btn"
              >
                Close
              </button>
            </div>

            {/* Filter Search */}
            <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2 select-none">
              <Search className="w-4 h-4 text-stone-400" />
              <input 
                type="text"
                className="flex-1 bg-transparent border-none text-xs text-stone-800 placeholder-stone-400 outline-none"
                placeholder="Search lessons (e.g. sum, parenthese, stack)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Lesson Catalog list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredChallenges.map((challenge) => {
                const isCompleted = profile.completedIds.includes(challenge.id);
                const isActive = challenge.id === selectedChallenge.id;
                return (
                  <div 
                    key={challenge.id}
                    onClick={() => handleSelectChallenge(challenge)}
                    className={`lesson-card p-4 rounded-xl flex items-start justify-between cursor-pointer ${
                      isActive ? "bg-blue-50/20 border-[#113f8c] border-2" : ""
                    }`}
                  >
                    <div className="space-y-1 pr-4 text-left">
                      <div className="flex items-center gap-2 select-none">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          challenge.difficulty === "Easy" ? "bg-emerald-500" : "bg-amber-500"
                        }`}></span>
                        <h5 className="font-serif font-bold text-sm text-stone-950">{challenge.name}</h5>
                        <span className="text-[10px] font-mono text-stone-400">({challenge.difficulty})</span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {challenge.description}
                      </p>
                      <span className="text-[10px] font-mono text-[#113f8c] block font-semibold pt-1">
                        Target Complexity: {challenge.optimalComplexity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 select-none">
                      {isCompleted ? (
                        <span className="p-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-3xs" title="Lesson complete">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-stone-300"></span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredChallenges.length === 0 && (
                <div className="text-center py-10 text-stone-400 text-xs font-mono select-none">
                  No algorithmic matching tests found. Try adjusting your query parameters!
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="h-10 bg-[#faf9f6]/95 border-t border-[#e7e5e0] flex items-center justify-between px-6 text-[10px] font-mono text-stone-400 shrink-0 select-none">
        <div className="flex gap-4">
          <span>NEST SYSTEM STREAMS</span>
          <span>AIRGAPPED OFFLINE SECURITY SIMULATOR</span>
        </div>
        <div className="flex gap-2">
          <span>PORT 3000 Connected</span>
        </div>
      </footer>

    </div>
  );
}
