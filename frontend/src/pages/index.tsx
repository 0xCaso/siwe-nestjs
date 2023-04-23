import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe';

const Home = () => {
    const [username, setUsername] = useState("");
    const [signedUp, setSignedUp] = useState(false);
    const [signUpError, setSignUpError] = useState("");
    const [signedIn, setSignedIn] = useState(false);
    const [signInError, setSignInError] = useState("");
    const { address } = useAccount()
    const { chain } = useNetwork()
    const { signMessageAsync } = useSignMessage()

    const userExists = async () => {
        const response = await fetch("http://localhost:3090/user/exists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                address: address
            })
        });
        const exists = await response.json();
        if (exists) {
            setSignedUp(true);
        } else {
            setSignedUp(false);
        }
    };

    const userIsSignedIn = async () => {
        const cookies = document.cookie.split(";");
        let token;
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].split("=");
            if (cookie[0].trim() === address) {
                token = cookie[1];
            }
        }
        const response = await fetch("http://localhost:3090/user/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        const profile = await response.json();
        if (profile.address) {
            setSignedIn(true);
            setUsername(profile.username);
        } else {
            setSignedIn(false);
        }
    };

    useEffect(() => {
        if (address) {
            userExists();
            userIsSignedIn();
        }
    }, [address, signedUp, signedIn]);

    const domain = window.location.host;

    const callSignUp = async () => {
        const message = new SiweMessage({
            domain, 
            address: address,
            statement: username,
            uri: origin,
            version: '1',
            chainId: chain?.id,
        });
        const preparedMessage = message.prepareMessage();
        const signature = await signMessageAsync({ message: preparedMessage });
        const response = await fetch("http://localhost:3090/user/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                address: address,
                message: preparedMessage,
                signature: signature
            })
        });
        let data;
        try {
            data = await response.json();
            if (data.id) {
                setSignedUp(true);
                setSignUpError("");
            }
        } catch (e) {
            setSignUpError("Sign-Up failed, probably your username or address is already registered.");
        }
    };

    const callSignIn = async () => {
        const message = new SiweMessage({
            domain, 
            address: address,
            statement: address,
            uri: origin,
            version: '1',
            chainId: chain?.id,
        });
        const preparedMessage = message.prepareMessage();
        const signature = await signMessageAsync({ message: preparedMessage });
        const response = await fetch("http://localhost:3090/user/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                address: address,
                message: preparedMessage,
                signature: signature
            })
        });
        let jwtToken;
        try {
            jwtToken = await response.json();
            document.cookie = `${address}=${jwtToken.access_token}`;
            setSignedIn(true);
            setSignInError("");
        } catch (e) {
            setSignInError("Sign-In failed.");
        }
    };

    const signUpForm = 
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    }}>
        <p>Choose a username and sign-up!</p>
        <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
                marginTop: "1em",
                width: "10em",
            }}
        />
        <button type="submit" onClick={callSignUp} style={{
            marginTop: "1em",
            width: "7em",
            height: "3em",
        }}>
            Sign-Up
        </button>
        { signUpError && <p>{signUpError}</p> }
    </div>

    const signInButton = 
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    }}>
        <p>Sign-in to access your account!</p>
        <button type="submit" onClick={callSignIn} style={{
            marginTop: "1em",
            width: "15em",
            height: "3em",
            alignItems: "center",
        }}>
            Sign-In With Ethereum
        </button>
        { signInError && <p>{signInError}</p> }
    </div>

    const cutAddress = (address: `0x${string}` | undefined) => {
        return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
    };

    return (
        <div>
            <div style={{
                display: "flex",
                flexDirection: "column",
                width: "50%",
                margin: "auto",
                marginTop: "5em"
            }}>
                { !address && 
                    <div style={{
                        textAlign: "center"
                    }}>
                        <p>Please connect your wallet first.</p>
                    </div>
                }
                { address && !signedUp && signUpForm }
                { address && signedUp && !signedIn && signInButton }
                { address && username && signedIn &&
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "35%",
                        margin: "auto",
                    }}>
                        <p style={{ margin: "0.5em 0"}}>
                            <b>Username</b>: <span style={{ float: "right" }}>{username}</span>
                        </p>
                        <p style={{ margin: "0.5em 0"}}>
                            <b>Address</b>: <span style={{ float: "right" }}>{cutAddress(address)}</span>
                        </p>
                    </div>
                }
            </div>
        </div>
    );
};
    
export default Home;