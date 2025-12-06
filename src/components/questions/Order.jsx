import React, { useState, useEffect } from 'react';
import Button from '../Button';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';

export default function Order({ question, onAnswer }) {
    const [items, setItems] = useState(question.items);

    // Reset items when question changes
    useEffect(() => {
        setItems(question.items);
    }, [question]);

    const handleSubmit = () => {
        const currentOrder = items.map(item => item.id);
        onAnswer(currentOrder);
    };

    return (
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            <div className="flex-none pb-4">
                <h2 className="text-xl font-bold text-center text-gray-800 leading-relaxed">
                    {question.question}
                </h2>
                <p className="text-center text-sm text-gray-500 mt-2">Drag to reorder</p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-3">
                    {items.map((item) => (
                        <Reorder.Item key={item.id} value={item}>
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-omani-gold/50">
                                <div className="text-gray-400">
                                    <GripVertical size={20} />
                                </div>
                                <span className="font-medium text-gray-700">{item.text}</span>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            <Button onClick={handleSubmit} className="mt-auto mb-4">
                Confirm Order
            </Button>
        </div>
    );
}
