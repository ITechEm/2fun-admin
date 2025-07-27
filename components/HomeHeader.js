import {useSession} from "next-auth/react";
import {signOut} from "next-auth/react";
import {useRouter} from "next/router";

export default function HomeHeader() {
  const {data:session} = useSession();
  const inactiveLink = 'flex gap-1 p-1';
  const router = useRouter();
  async function logout() {
    await router.push('/');
    await signOut();
  }
  return (
    <div className="text-blue-900 flex justify-between">
      <h2 className="mt-0">
        {/* <div className="flex gap-2 items-center">
          <img src={session?.user?.image} alt="" className="w-6 h-6 rounded-md sm:hidden"/>
          <div>
            Hello, <b>{session?.user?.name}</b>
          </div>
        </div> */}
      </h2>
      <div className="hidden sm:block">
        {/* <div className="bg-gray-300 flex gap-1 text-black rounded-lg overflow-hidden">
          <img src={session?.user?.image} alt="" className="w-6 h-6"/>
          <span className="px-2">
            {session?.user?.name}
          </span>
        </div> */}
        <button onClick={logout} className={inactiveLink}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}