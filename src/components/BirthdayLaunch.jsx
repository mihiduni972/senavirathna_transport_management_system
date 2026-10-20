import { useEffect, useState } from "react";
import "./BirthdayLaunch.css";

const LAUNCH_DATE = new Date(
  "2026-10-07T13:00:00+05:30"
);

function getTimeLeft() {
  const now = new Date();
  const difference = LAUNCH_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      launched: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    ),
    launched: false,
  };
}

function BirthdayLaunch({ onLaunchComplete }) {

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  const [launched, setLaunched] = useState(
    getTimeLeft().launched
  );

  useEffect(() => {

    // Prevent scrolling only while birthday launch screen is active
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setInterval(() => {

      const remaining = getTimeLeft();

      setTimeLeft(remaining);

      if (remaining.launched) {
        setLaunched(true);
        clearInterval(timer);
      }

    }, 1000);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = previousOverflow;
    };

  }, []);


  const celebrationItems = [
    "🌸",
    "🌼",
    "🌺",
    "🌷",
    "✨",
    "🎉",
    "🎊",
    "💐",
    "⭐",
    "🌸",
    "🎈",
    "🌼",
    "✨",
    "🎊",
    "🌺",
    "🌷",
    "⭐",
    "🎉",
    "🌸",
    "💐",
    "🌹",
    "✨",
    "🎈",
    "🎉",
    "🌼",
    "💐",
    "⭐",
    "🌺"
  ];


  // ==============================
  // AFTER LAUNCH
  // ==============================

  if (launched) {

    return (

      <div className="birthday-launch launch-screen">

        <div className="celebration-layer">

          {celebrationItems.map((item, index) => (

            <span
              key={index}
              className="falling-item"
              style={{
                left: `${(index * 3.6) % 100}%`,
                animationDelay: `${(index % 8) * 0.35}s`,
                animationDuration: `${4 + (index % 5)}s`
              }}
            >
              {item}
            </span>

          ))}

        </div>


        {/* BALLOONS */}

        <div className="balloon balloon-one">
          🎈
        </div>

        <div className="balloon balloon-two">
          🎈
        </div>

        <div className="balloon balloon-three">
          🎈
        </div>

        <div className="balloon balloon-four">
          🎈
        </div>


        {/* GLOW */}

        <div className="glow glow-one"></div>

        <div className="glow glow-two"></div>


        {/* CONTENT */}

        <div className="launch-content">

          <div className="big-celebration">
            🎉
          </div>


          <p className="launch-small-text">
            TODAY IS A SPECIAL DAY
          </p>


          <h1>
            Happy 30th Birthday!
          </h1>


          <div className="gold-line"></div>


          <h2>
            Dilshan Chamika
          </h2>


          <p className="gift-text">
            A Special Birthday Gift
          </p>


          <div className="birthday-message">

            <span>
              🎂
            </span>

            <div>

              <strong>
                Senavirathna Transport
              </strong>

              <small>
                Management System
              </small>

            </div>

            <span>
              🚀
            </span>

          </div>


          <div className="live-badge">

            <span className="live-dot"></span>

            SYSTEM IS NOW LIVE

          </div>


          <button
            type="button"
            className="enter-button"
            onClick={onLaunchComplete}
          >

            ENTER SYSTEM

            <span>
              →
            </span>

          </button>


          <p className="enter-help">
            Your special journey starts here
          </p>

        </div>

      </div>

    );
  }


  // ==============================
  // COUNTDOWN SCREEN
  // ==============================

  return (

    <div className="birthday-launch countdown-screen">

      <div className="celebration-layer">

        {celebrationItems.map((item, index) => (

          <span
            key={index}
            className="falling-item"
            style={{
              left: `${(index * 3.6) % 100}%`,
              animationDelay: `${(index % 8) * 0.4}s`,
              animationDuration: `${5 + (index % 4)}s`
            }}
          >
            {item}
          </span>

        ))}

      </div>


      {/* BALLOONS */}

      <div className="balloon balloon-one">
        🎈
      </div>

      <div className="balloon balloon-two">
        🎈
      </div>

      <div className="balloon balloon-three">
        🎈
      </div>


      {/* BACKGROUND */}

      <div className="background-circle circle-one"></div>

      <div className="background-circle circle-two"></div>


      {/* MAIN CONTENT */}

      <div className="main-container">

        <div className="main-logo">
          S
        </div>


        <p className="welcome-text">
          ✨ A SPECIAL DAY • A NEW BEGINNING ✨
        </p>


        <h1 className="main-title">
          Senavirathna Transport
        </h1>


        <p className="main-subtitle">
          Management System
        </p>


        <div className="birthday-card">

          <div className="cake">
            🎂
          </div>


          <p className="birthday-label">
            🎉 30TH BIRTHDAY CELEBRATION 🎉
          </p>


          <h2>
            Dilshan Chamika
          </h2>


          <p className="card-description">
            Something special is about to begin...
          </p>


          <div className="divider"></div>


          <p className="launch-label">
            SYSTEM LAUNCHING IN
          </p>


          {/* COUNTDOWN */}

          <div className="countdown">

            {/* DAYS */}

            <div className="time-box">

              <span>
                {String(timeLeft.days).padStart(2, "0")}
              </span>

              <small>
                DAYS
              </small>

            </div>


            <div className="separator">
              :
            </div>


            {/* HOURS */}

            <div className="time-box">

              <span>
                {String(timeLeft.hours).padStart(2, "0")}
              </span>

              <small>
                HOURS
              </small>

            </div>


            <div className="separator">
              :
            </div>


            {/* MINUTES */}

            <div className="time-box">

              <span>
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>

              <small>
                MINUTES
              </small>

            </div>


            <div className="separator">
              :
            </div>


            {/* SECONDS */}

            <div className="time-box">

              <span>
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>

              <small>
                SECONDS
              </small>

            </div>

          </div>


          <p className="bottom-message">
            🎁 Something beautiful is waiting for you...
          </p>

        </div>

      </div>

    </div>

  );
}

export default BirthdayLaunch;