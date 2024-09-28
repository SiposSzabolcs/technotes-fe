import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'
import usePersist from '../../hooks/usePersist'
import useTitle from '../../hooks/useTitle'
import PulseLoader from 'react-spinners/PulseLoader'

const Login = () => {
    useTitle('Employee Login')

    const userRef = useRef()
    const errRef = useRef()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const [persist, setPersist] = usePersist()
    const [showMessage, setShowMessage] = useState(false);

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [login, { isLoading }] = useLoginMutation()

    const handleClick = (user) => {
        if (user === "admin") {
            setUsername("demoadmin")
        } else if (user === "employee") {
            setUsername("demoemployee")
        }
        setPassword("demo")
    }

    useEffect(() => {
        userRef.current.focus()
        let timer;
        if (isLoading) {
            timer = setTimeout(() => {
                setShowMessage(true);
            }, 3000);
        } else {
            setShowMessage(false);
        }
        return () => clearTimeout(timer);
    }, [isLoading])

    useEffect(() => {
        setErrMsg('');
    }, [username, password])


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { accessToken } = await login({ username, password }).unwrap()
            dispatch(setCredentials({ accessToken }))
            setUsername('')
            setPassword('')
            navigate('/dash')
        } catch (err) {
            if (!err.status) {
                setErrMsg('No Server Response');
            } else if (err.status === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg(err.data?.message);
            }
            errRef.current.focus();
        }
    }

    const handleUserInput = (e) => setUsername(e.target.value)
    const handlePwdInput = (e) => setPassword(e.target.value)
    const handleToggle = () => setPersist(prev => !prev)

    const errClass = errMsg ? "errmsg" : "offscreen"

    if (isLoading) {
        <PulseLoader color={"#FFF"} />
        setTimeout(() => {
            <>
                <PulseLoader color={"#FFF"} />
                <h2>Api currently spun down. Please wait 1-2 minutes for it to start.</h2>
            </>
        }, 3000)
    }


    const content = (
        <section className="public">
            <header>
                <h1>Employee Login</h1>
            </header>
            <main className="login">
                <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

                <form className="form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username:</label>
                    <input
                        className="form__input"
                        type="text"
                        id="username"
                        ref={userRef}
                        value={username}
                        onChange={handleUserInput}
                        autoComplete="off"
                        required
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        className="form__input"
                        type="password"
                        id="password"
                        onChange={handlePwdInput}
                        value={password}
                        required
                    />
                    <button className="form__submit-button">Sign In</button>
                    <button type="button" className="form__submit-button" onClick={() => handleClick("employee")}>Use Employee demo user</button>
                    <button type="button" className="form__submit-button" onClick={() => handleClick("admin")}>Use Admin demo user</button>


                    <label htmlFor="persist" className="form__persist">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            id="persist"
                            onChange={handleToggle}
                            checked={persist}
                        />
                        Trust This Device
                    </label>
                </form>
                {isLoading && !showMessage && (
                    <PulseLoader color={"#FFF"} />
                )}
                {showMessage && (
                    <>
                        <PulseLoader color={"#FFF"} />
                        <h2>Api currently spun down. Please wait 1-2 minutes for it to start.</h2>
                    </>
                )}
            </main>
            <footer>
                <Link to="/">Back to Home</Link>
            </footer>
        </section>
    )

    return content
}
export default Login