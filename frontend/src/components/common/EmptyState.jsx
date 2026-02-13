export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4 opacity-30">&#9655;</div>
      <h3 className="text-lg font-medium text-dm-text mb-2">{title}</h3>
      {description && (
        <p className="text-dm-muted text-sm max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
