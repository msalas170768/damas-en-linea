export default function Cell({
  piece,
  isDark,
  isSelected,
  isValidMove,
  isValidCapture,
  isLastFrom,
  isLastTo,
  isMandatory,
  onClick,
}) {
  const classes = [
    'cell',
    isDark ? 'dark' : 'light',
    isDark && (piece || isValidMove || isValidCapture) ? 'clickable' : '',
    isSelected ? 'selected' : '',
    isLastFrom ? 'last-from' : '',
    isLastTo ? 'last-to' : '',
    isValidCapture ? 'valid-capture' : '',
    isMandatory ? 'mandatory' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {piece && (
        <div className={`piece ${piece.player} ${piece.king ? 'king' : ''}`} />
      )}
      {isValidMove && !piece && <div className="move-hint" />}
    </div>
  );
}
