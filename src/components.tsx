import React, { useState, useCallback, useRef } from "react";

interface ICard {
  id: number;
  color: string;
  x: number; 
  y: number; 
}

const getRandomColor = () => {
  return `hsl(${Math.random() * 360}, 70%, 70%)`; 
};

const column1 = [
  { id: 1, color: getRandomColor(), x: 0, y: 0 },
  { id: 2, color: getRandomColor(), x: 0, y: 0 },
  { id: 3, color: getRandomColor(), x: 0, y: 0 },
  { id: 4, color: getRandomColor(), x: 0, y: 0 },
];

const column2 = [
  { id: 5, color: getRandomColor(), x: 0, y: 0 },
  { id: 6, color: getRandomColor(), x: 0, y: 0 },
  { id: 7, color: getRandomColor(), x: 0, y: 0 },
  { id: 8, color: getRandomColor(), x: 0, y: 0 },
];

const TestDrag = () => {
  const [col1, setCol1] = useState(column1);
  const [col2, setCol2] = useState(column2);

  const [isDrag, setIsDrag] = useState(false);
  const [dragCard, setDragCard] = useState<ICard | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dropIndex, setDropIndex] = useState<number>(-1);
  const [dropColumn, setDropColumn] = useState<string>("");

  const col1Ref = useRef<HTMLDivElement>(null); 
  const col2Ref = useRef<HTMLDivElement>(null); 

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, card: ICard) => {
      const rect = e.currentTarget.getBoundingClientRect();
      
      // Calculate offset from mouse to top-left corner of card
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      setIsDrag(true);
      setDragCard(card);
      setDragOffset({ x: offsetX, y: offsetY });
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Prevent text selection
      e.preventDefault();
    },
    []
  );

  const getDropIndex = (mouseY: number, columnRef: React.RefObject<HTMLDivElement>, cards: ICard[]): number => {
    if (!columnRef.current) return -1;
    
    const columnRect = columnRef.current.getBoundingClientRect();
    const relativeY = mouseY - columnRect.top;
    
    // Account for header and padding
    const headerHeight = 50; // approximate height for title and spacing
    const cardHeight = 150;
    const cardSpacing = 20; // space-y-5 = 20px
    
    // If mouse is in header area, insert at beginning
    if (relativeY < headerHeight) {
      return 0;
    }
    
    // Calculate which card position we're over
    const adjustedY = relativeY - headerHeight;
    const cardIndex = Math.floor(adjustedY / (cardHeight + cardSpacing));
    
    // If we're in the lower half of a card, insert after it
    const positionInCard = adjustedY % (cardHeight + cardSpacing);
    const insertIndex = positionInCard > cardHeight / 2 ? cardIndex + 1 : cardIndex;
    
    return Math.min(Math.max(0, insertIndex), cards.length);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDrag || !dragCard) return;

      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Calculate drop position
      const col1Bounds = col1Ref.current?.getBoundingClientRect();
      const col2Bounds = col2Ref.current?.getBoundingClientRect();

      if (col1Bounds && col2Bounds) {
        const isMouseInCol1 =
          e.clientX >= col1Bounds.left &&
          e.clientX <= col1Bounds.right &&
          e.clientY >= col1Bounds.top &&
          e.clientY <= col1Bounds.bottom;

        const isMouseInCol2 =
          e.clientX >= col2Bounds.left &&
          e.clientX <= col2Bounds.right &&
          e.clientY >= col2Bounds.top &&
          e.clientY <= col2Bounds.bottom;

        if (isMouseInCol1) {
          setDropColumn("col1");
          setDropIndex(getDropIndex(e.clientY, col1Ref, col1));
        } else if (isMouseInCol2) {
          setDropColumn("col2");
          setDropIndex(getDropIndex(e.clientY, col2Ref, col2));
        } else {
          setDropColumn("");
          setDropIndex(-1);
        }
      }
    },
    [isDrag, dragCard, col1, col2]
  );

  const handleMouseUp = useCallback(() => {
    if (isDrag && dragCard) {
      const col1Bounds = col1Ref.current?.getBoundingClientRect();
      const col2Bounds = col2Ref.current?.getBoundingClientRect();

      if (col1Bounds && col2Bounds) {
        const isMouseInCol1 =
          mousePosition.x >= col1Bounds.left &&
          mousePosition.x <= col1Bounds.right &&
          mousePosition.y >= col1Bounds.top &&
          mousePosition.y <= col1Bounds.bottom;

        const isMouseInCol2 =
          mousePosition.x >= col2Bounds.left &&
          mousePosition.x <= col2Bounds.right &&
          mousePosition.y >= col2Bounds.top &&
          mousePosition.y <= col2Bounds.bottom;

        // Reset card position when dropping
        const resetCard = { ...dragCard, x: 0, y: 0 };

        if (isMouseInCol1 && dropIndex >= 0) {
          const isCardInCol1 = col1.some(card => card.id === dragCard.id);
          if (!isCardInCol1) {
            // Moving from col2 to col1
            setCol2((prev) => prev.filter((card) => card.id !== dragCard.id));
            setCol1((prev) => {
              const newCol = [...prev];
              newCol.splice(dropIndex, 0, resetCard);
              return newCol;
            });
          } else {
            // Reordering within col1
            setCol1((prev) => {
              const newCol = prev.filter((card) => card.id !== dragCard.id);
              const adjustedIndex = dropIndex > prev.findIndex(card => card.id === dragCard.id) ? dropIndex - 1 : dropIndex;
              newCol.splice(adjustedIndex, 0, resetCard);
              return newCol;
            });
          }
        } else if (isMouseInCol2 && dropIndex >= 0) {
          const isCardInCol2 = col2.some(card => card.id === dragCard.id);
          if (!isCardInCol2) {
            // Moving from col1 to col2
            setCol1((prev) => prev.filter((card) => card.id !== dragCard.id));
            setCol2((prev) => {
              const newCol = [...prev];
              newCol.splice(dropIndex, 0, resetCard);
              return newCol;
            });
          } else {
            // Reordering within col2
            setCol2((prev) => {
              const newCol = prev.filter((card) => card.id !== dragCard.id);
              const adjustedIndex = dropIndex > prev.findIndex(card => card.id === dragCard.id) ? dropIndex - 1 : dropIndex;
              newCol.splice(adjustedIndex, 0, resetCard);
              return newCol;
            });
          }
        }
      }

      setIsDrag(false);
      setDragCard(null);
      setDragOffset({ x: 0, y: 0 });
      setDropIndex(-1);
      setDropColumn("");
    }
  }, [isDrag, dragCard, mousePosition, col1, col2, dropIndex]);

  React.useEffect(() => {
    if (isDrag) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrag, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex justify-between space-x-10 mt-10 mx-20">

       {isDrag && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 70%)`,
            zIndex: 10
          }}
        />
      )}
      
      {/* Column 1 */}
      <div
        ref={col1Ref} 
        className="flex flex-col w-[300px] space-y-5 border-dashed border-2 border-gray-400 p-4 min-h-[400px]"
      >
        <h3 className="text-center font-semibold mb-2">Column 1</h3>
        {col1.map((card, index) => (
          <div key={card.id}>
            {/* Drop indicator */}
            {isDrag && dropColumn === "col1" && dropIndex === index && (
              <div className="h-32 w-52 bg-blue-500 rounded-lg mb-5 opacity-75"></div>
            )}
            <div
              className="flex items-center justify-center text-white font-bold text-xl select-none"
              style={{
                backgroundColor: card.color,
                width: 200,
                height: 150,
                borderRadius: "8px",
                cursor: "move",
                position: isDrag && dragCard?.id === card.id ? "fixed" : "relative",
                left: isDrag && dragCard?.id === card.id ? mousePosition.x - dragOffset.x : "auto",
                top: isDrag && dragCard?.id === card.id ? mousePosition.y - dragOffset.y : "auto",
                zIndex: isDrag && dragCard?.id === card.id ? 20 : "auto",
                opacity: isDrag && dragCard?.id === card.id ? 0.8 : 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, card)} 
            >
              Card {card.id}
            </div>
          </div>
        ))}
        {/* Drop indicator at the end */}
        {isDrag && dropColumn === "col1" && dropIndex === col1.length && (
          <div className="h-32 w-52 bg-blue-500 rounded-lg opacity-75"></div>
        )}
      </div>

      {/* Column 2 */}
      <div
        ref={col2Ref} 
        className="flex flex-col w-[300px] space-y-5 border-dashed border-2 border-gray-400 p-4 min-h-[400px]"
      >
        <h3 className="text-center font-semibold mb-2">Column 2</h3>
        {col2.map((card, index) => (
          <div key={card.id}>
            {/* Drop indicator */}
            {isDrag && dropColumn === "col2" && dropIndex === index && (
              <div className="h-32 w-52 bg-blue-500 rounded-lg mb-5 opacity-75"></div>
            )}
            <div
              className="flex items-center justify-center text-white font-bold text-xl select-none"
              style={{
                backgroundColor: card.color,
                width: 200,
                height: 150,
                borderRadius: "8px",
                cursor: "move",
                position: isDrag && dragCard?.id === card.id ? "fixed" : "relative",
                left: isDrag && dragCard?.id === card.id ? mousePosition.x - dragOffset.x : "auto",
                top: isDrag && dragCard?.id === card.id ? mousePosition.y - dragOffset.y : "auto",
                zIndex: isDrag && dragCard?.id === card.id ? 20 : "auto",
                opacity: isDrag && dragCard?.id === card.id ? 0.8 : 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, card)} 
            >
              Card {card.id}
            </div>
          </div>
        ))}
        {/* Drop indicator at the end */}
        {isDrag && dropColumn === "col2" && dropIndex === col2.length && (
          <div className="h-32 w-52 bg-blue-500 rounded-lg opacity-75"></div>
        )}
      </div>
    </div>
  );
};

export default TestDrag;
