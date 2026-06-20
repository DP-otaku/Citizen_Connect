import './LoadingSpinner.css';

export default function LoadingSpinner({ fullscreen = false, size = 'md', message }) {
  const spinner = (
    <div className={`spinner spinner--${size}`}>
      <div className="spinner__ring spinner__ring--outer" />
      <div className="spinner__ring spinner__ring--middle" />
      <div className="spinner__ring spinner__ring--inner" />
      <div className="spinner__dot" />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="spinner-overlay">
        {spinner}
        {message && <p className="spinner-overlay__message">{message}</p>}
      </div>
    );
  }

  return (
    <div className={`spinner-inline spinner-inline--${size}`}>
      {spinner}
      {message && <p className="spinner-inline__message">{message}</p>}
    </div>
  );
}
