/* eslint-disable @next/next/no-img-element */

const HomePage = () => {
  return (
    <div className="flex min-h-screen w-full flex-row items-center justify-between gap-8 bg-background p-8">
      <div className="flex w-[60%] items-center justify-center">
        <img
          src="/assets/images/welcome-screen.png"
          alt="logo"
          width={100}
          height={100}
          className="h-auto w-full max-w-md object-contain"
        />
      </div>
      <div className="flex flex-1 items-center justify-center"></div>
    </div>
  );
};
export default HomePage;
