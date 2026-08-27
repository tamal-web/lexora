export default function EDpage() {
  return (
    <div className="flex-1 bg-[url('/ed-bg.png')] bg-cover bg-center bg-no-repeat">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/vid/v1.mp4" type="video/mp4" />
      </video>

      <div>hi</div>
    </div>
  )
}
