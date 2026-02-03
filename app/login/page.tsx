import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Archetype Lens</h1>
          <p className="text-zinc-400 mt-2">Sign in to save your selections and request new content</p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            formAction={login}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Send Magic Link
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          We'll email you a magic link for password-free sign in.
        </p>
      </div>
    </div>
  )
}
