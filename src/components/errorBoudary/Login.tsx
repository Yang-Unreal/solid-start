export default function Login() {
  if (true) {
    console.log("Login component: Intentionally throwing error.");
    throw new Error("Login has broke (intentional test error)");
  }

  return <div>This content should not be rendered.</div>;
}
