import Head from "next/head";

import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Whatsapp</title>
      </Head>
      <Sidebar />
    </div>
  );
}
