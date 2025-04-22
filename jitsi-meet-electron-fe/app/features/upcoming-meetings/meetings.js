import moment from 'moment';

export function getMeetings() {
    return [
        {
            id: '1',
            title: 'Sprint Planning',
            startDate: moment().set({ hour: 11, minute: 0, second: 0, millisecond: 0 }),
            endDate: moment().set({ hour: 12, minute: 0, second: 0, millisecond: 0 }),
            location: 'Zoom',
            participants: [
                { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1' },
                { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2' }
            ]
        },
        {
            id: '2',
            title: 'Design Review',
            startDate: moment().set({ hour: 12, minute: 0, second: 0, millisecond: 0 }),
            endDate: moment().set({ hour: 12, minute: 45, second: 0, millisecond: 0 }),
            location: 'Room 101',
            participants: [
                { id: 'u3', name: 'Charlie', avatar: 'https://i.pravatar.cc/40?img=3' }
            ]
        }
    ]
}
