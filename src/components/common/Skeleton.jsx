const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`h-4 w-full rounded-full bg-cloud-100 shimmer ${className}`.trim()}
    />
  )
}

export default Skeleton
