export function TopNavBar({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`z-1 mb-1 w-full flex-1 flex-row bg-background/30 px-8 pt-10 pb-5 backdrop-blur-[0.6rem] ${className}`}
    >
      <div className="flex max-w-[90%] flex-1 flex-row items-center justify-between">
        {children}
      </div>
    </div>
  )
}
