import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import firebase from "../firebase";
import {
    Firestore,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    collection,
} from "firebase/firestore";

class UserClass {
    login = async (mail, password) => {
        try {
            await signInWithEmailAndPassword(firebase.auth, mail, password);
            return true;
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                return "Geen gebruiker gevonden met dit emailadres";
            } else if (error.code === "auth/wrong-password") { 
                return "Wachtwoord is niet correct";
            } else if (error.code === "auth/invalid-email") {
                return "Email is niet geldig";
            } else if (error.code === "auth/user-disabled") {
                return "Gebruiker is uitgeschakeld";
            } else if (error.code === "auth/too-many-requests") {
                return "Te veel inlogpogingen, probeer het later opnieuw";
            } else if (error.code === "auth/invalid-credential") { 
                return "Wachtwoord of Email is niet correct";
            } else { 
                console.error(error.code);
                return null;
            }
        }

    }

    logout = async () => {
        signOut(firebase.auth).then(() => {
            return true;
        }).catch((error) => {
            return false;
        });
    }

    isLoggedIn = async () => {
        if (await getAuth().currentUser) {
            return true;
        } else {
            return false;
        }
    }

    isSchool = async () => {
        if (this.isLoggedIn()) {
            const userDoc = await getDoc(firebase.db, "users", firebase.auth.currentUser.uid).then(() => {
                return userDoc.data.userType == "school";
            }).catch((error) => {

            });
        }

        return false;
    }

    isTeacher = async () => {
        if (this.isLoggedIn()) {
            const userDoc = await getDoc(firebase.db, "users", firebase.auth.currentUser.uid).then(() => {
                return userDoc.data.userType == "teacher";
            }).catch((error) => {

            });
        }

        return false;
    }

    isStudent = async () => {
        if (this.isLoggedIn()) {
            const userDoc = await getDoc(firebase.db, "users", firebase.auth.currentUser.uid).then(() => {
                return userDoc.data.userType == "student";
            }).catch((error) => {

            });
        }

        return false;
    }


    getUserName = async () => {
        if (this.isLoggedIn()) {
            try {
                const userRef = doc(firebase.db, "users", firebase.auth.currentUser.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    return userDoc.data().displayName;
                } else {
                    console.error("No such document!");
                    return null;
                }
            } catch (error) {
                //console.error(error);
                return null;
            }
        }
        return false;
    };


    getUsersBySearch = async (search) => {
        const querySnapshot = await getDocs(collection(firebase.db, "users"));

        let validSearches = [];
        querySnapshot.forEach((doc) => {
            if (doc.data().displayName.toLowerCase().includes(search.toLowerCase())) {
                let user = doc.data();
                validSearches.push({
                    uid: doc.id,
                    type: "user",
                    data: user
                });

            }
        });

        if (validSearches.length == 0) {
            return null;
        }
        return validSearches;
    }


    getUserNameById = async (uid) => {
        try {
            const userRef = doc(firebase.db, "users", uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                return userDoc.data().displayName;
            } else {
                //console.error("No such user!");
                return "[deleted]";
            }
        } catch {
            (error) => {
                return "[unknown]";
            }
        };
    }

    isAdmin = async () => {
        if (this.isLoggedIn()) {
            const uid = getAuth().currentUser.uid;
            console.log("id", uid);
            const userDoc = await getDoc(firebase.db, "users", uid).then(() => {
                console.log("userDoc",userDoc.data);
                return userDoc.data.userType == "admin";
            }).catch((error) => {
                console.error(error);
            });
        }

        return false;
    }

    getMail = () => {
        return firebase.auth.currentUser.mail;
    }

    signUp = async (displayName, mail, password, userType) => {
        let uid;
        try {
            const userCredentials = await createUserWithEmailAndPassword(firebase.auth, mail, password);
            uid = userCredentials.user.uid;
            console.log(uid);

            await setDoc(doc(firebase.db, "users", uid), {
                userType: userType,
                displayName: displayName
            });

            return true;
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                return 'Email is al in gebruik';
            } else if (error.code === "auth/invalid-email") {
                return 'Email is niet geldig';
            } else if (error.code === "auth/weak-password") {
                return 'Wachtwoord is te zwak (minimaal 6 karakters)';
            } else {
                console.log(error.code);
                return null;
            }
        }
    }


    deleteUser = async () => {
        if (firebase.auth.currentUser) {
            await deleteDoc(doc(firebase.db, "users", firebase.auth.currentUser.uid));
            await firebase.auth.currentUser.delete();
        } else {
            console.warn("User is not logged in, log in before removing yourself as user");
        }
    }

    setSchoolID = async (schoolID) => {
       if (firebase.auth.currentUser) {
        const docRef = doc(firebase.db, "users", firebase.auth.currentUser.uid);
        await updateDoc(docRef, {schoolID: schoolID});
       }
    }

  
}

const user = new UserClass();

export default user;