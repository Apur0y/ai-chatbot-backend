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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDrag || !dragCard) return;

      setMousePosition({ x: e.clientX, y: e.clientY });
    },
    [isDrag, dragCard]
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

        if (isMouseInCol1) {
          // Only move if card is not already in col1
          const isCardInCol1 = col1.some(card => card.id === dragCard.id);
          if (!isCardInCol1) {
            setCol1((prev) => [...prev, resetCard]);
            setCol2((prev) => prev.filter((card) => card.id !== dragCard.id));
          }
        } else if (isMouseInCol2) {
          // Only move if card is not already in col2
          const isCardInCol2 = col2.some(card => card.id === dragCard.id);
          if (!isCardInCol2) {
            setCol2((prev) => [...prev, resetCard]);
            setCol1((prev) => prev.filter((card) => card.id !== dragCard.id));
          }
        }
      }

      setIsDrag(false);
      setDragCard(null);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isDrag, dragCard, mousePosition, col1, col2]);

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
        {col1.map((card) => (
          <div
            key={card.id}
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
         
            }}
            onMouseDown={(e) => handleMouseDown(e, card)} 
          >
            Card {card.id}
          </div>
        ))}
      </div>

      {/* Column 2 */}
      <div
        ref={col2Ref} 
        className="flex flex-col w-[300px] space-y-5 border-dashed border-2 border-gray-400 p-4 min-h-[400px]"
      >
        <h3 className="text-center font-semibold mb-2">Column 2</h3>
        {col2.map((card) => (
          <div
            key={card.id}
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
            
            }}
            onMouseDown={(e) => handleMouseDown(e, card)} 
          >
            Card {card.id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestDrag;
