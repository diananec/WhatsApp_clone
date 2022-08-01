import { Avatar, IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import MicIcon from "@material-ui/icons/Mic";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import { useCollection } from "react-firebase-hooks/firestore";
import Message from "./Message";
import { useRef, useState } from "react";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";
import {
  addDoc,
  collection,
  doc,
  query,
  setDoc,
  where,
} from "firebase/firestore";

function ChatScreen({ chat, messages }) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [input, setInput] = useState("");
  const endOfMessageRef = useRef(null);

  const messageRef = doc(db, "chats", router.query.id);
  const newRef = doc(db, "messages", messageRef);
  const q = query(newRef, orderBy("timestamp", "asc"));

  const [messagesSnapshot] = useCollection(q);

  const [recipientSnapshot] = useCollection(
    query(
      collection(db, "users"),
      where("email", "==", getRecipientEmail(chat.users, user))
    )
  );

  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data().timestamp?.toDate().getTime(),
          }}
        />
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message key={message.id} user={message.user} message={message} />
      ));
    }
  };

  const scrollToBottom = () => {
    endOfMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    //Update the last seen
    await setDoc(
      doc(db, "users", user.uid),
      {
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const a = doc(db, "chats", router.query.id);
    await addDoc(collection(a, "messages"), {
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      user: user.email,
      photoURL: user.photoURL,
    });
    setInput("");
    scrollToBottom();
  };

  const recipient = recipientSnapshot?.docs?.[0]?.data();
  const recipientEmail = getRecipientEmail(chat.users, user);

  return (
    <Container>
      <Header>
        <Avatar />
        <HeaderInformation>
          <h3>{recipientEmail}</h3>
          {recipientSnapshot ? (
            <p>
              Last active:{" "}
              {recipient?.lastSeen?.toDate() ? (
                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
              ) : (
                "Unavailable"
              )}
            </p>
          ) : (
            <p>Loading Last active...</p>
          )}
        </HeaderInformation>
        <HeaderIcons>
          <IconButton>
            <AttachFileIcon />
            <MoreVertIcon />
          </IconButton>
        </HeaderIcons>
      </Header>

      <MessageContainer>
        {showMessages()}
        <EndOfMessage ref={endOfMessageRef} />
      </MessageContainer>
      <InputContainer>
        <InsertEmoticonIcon />
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
          Send Message
        </button>
        <MicIcon />
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div``;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const Header = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  padding: 11px;
  height: 80px;
  align-items: center;
  border-bottom: 1px solid whitesmoke;
`;

const Input = styled.input`
  flex: 1;
  outline: 0;
  padding: 20px;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  margin-left: 15px;
  margin-right: 15px;
`;

const HeaderInformation = styled.div`
  margin-left: 15px;
  flex: 1;

  > h3 {
    margin-bottom: 3px;
  }

  > p {
    font-size: 14px;
    color: grey;
  }
`;

const HeaderIcons = styled.div``;

const EndOfMessage = styled.div`
  margin-bottom: 50px;
`;

const MessageContainer = styled.div`
  padding: 13px;
  background-color: #e5ded8;
  min-height: 90vh;
`;
