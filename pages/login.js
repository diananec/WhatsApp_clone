import { Button } from "@material-ui/core";
import Head from "next/head";
import styled from "styled-components";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

function Login() {
  const signIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docs = await getDocs(q);

      if (docs.docs.length === 0) {
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          name: user.displayName,
          authProvider: "google",
          email: user.email,
          photoURL: user.photoURL,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Container>
        <Head>
          <title>Login</title>
        </Head>

        <LoginContainer>
          <Logo src="http://assets.stickpng.com/images/580b57fcd9996e24bc43c543.png" />
          <Button onClick={signIn} variant="outlined">
            Sign in with Google
          </Button>
        </LoginContainer>
      </Container>
    </div>
  );
}

export default Login;

const Container = styled.div`
  display: grid;
  place-items: center;
  height: 100vh;
  background-color: whitesmoke;
`;
const LoginContainer = styled.div`
  padding: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0px 4px 14px -3px rgba(0, 0, 0, 0.7);
`;

const Logo = styled.img`
  height: 200px;
  width: 200px;
  margin-bottom: 50px;
`;
