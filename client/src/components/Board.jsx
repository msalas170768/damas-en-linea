import Cell from './Cell';

export default function Board({ board, myColor, selectedPiece, validCaptures, validMoves, mandatoryPiece, lastMove, onCellClick }) {
  if (!board) return null;

  // Convert actual [r,c] → display [r,c] for current player
  const toDisplay = (actualPos) => {
    if (!actualPos) return null;
    const [r, c] = actualPos;
    return myColor === 'black' ? [7 - r, 7 - c] : [r, c];
  };

  const selDisplay = toDisplay(selectedPiece);
  const mandDisplay = toDisplay(mandatoryPiece);
  const lastFromDisplay = toDisplay(lastMove?.from);
  const lastToDisplay = toDisplay(lastMove?.to);

  const validCaptureDisplays = validCaptures.map(cap => toDisplay(cap.to));
  const validMoveDisplays = validMoves.map(pos => toDisplay(pos));

  const eqPos = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];

  const rows = myColor === 'black'
    ? [...board].reverse().map(row => [...row].reverse())
    : board;

  return (
    <div className="board-wrap">
      <div className="board">
        {rows.map((row, dr) =>
          row.map((piece, dc) => {
            const isDark = (dr + dc) % 2 === 1;
            const displayPos = [dr, dc];

            const isSelected = eqPos(displayPos, selDisplay);
            const isValidCapture = isDark && validCaptureDisplays.some(p => eqPos(displayPos, p));
            const isValidMove = isDark && validMoveDisplays.some(p => eqPos(displayPos, p));
            const isLastFrom = eqPos(displayPos, lastFromDisplay);
            const isLastTo = eqPos(displayPos, lastToDisplay);
            const isMandatory = eqPos(displayPos, mandDisplay);

            return (
              <Cell
                key={`${dr}-${dc}`}
                piece={piece}
                isDark={isDark}
                isSelected={isSelected}
                isValidCapture={isValidCapture}
                isValidMove={isValidMove}
                isLastFrom={isLastFrom}
                isLastTo={isLastTo}
                isMandatory={isMandatory}
                onClick={() => isDark && onCellClick(dr, dc)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
