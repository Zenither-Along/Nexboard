export function TestSidebar() {
    return (
        <div 
            className="fixed left-0 top-0 w-32 h-32 bg-red-500 z-[99999]"
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '128px',
                height: '128px',
                backgroundColor: 'red',
                zIndex: 99999
            }}
        >
            <p className="text-white p-4">TEST</p>
        </div>
    );
}
