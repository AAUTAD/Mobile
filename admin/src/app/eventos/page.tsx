"use client"

import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Pencil, Trash2, Search, CalendarIcon, Eye, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EventForm } from "~/components/event-form";
import { type Event } from "~/schemas/events-schema";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";


export default function EventosPage() {
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [viewEvent, setViewEvent] = useState<Event | null>(null);
    const [viewEventOpen, setViewEventOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [locationFilter, setLocationFilter] = useState('');
    const [timeRangeFilter, setTimeRangeFilter] = useState('all'); // 'all', 'upcoming', 'past'
    const { data: events, isLoading } = api.events.getAll.useQuery();

    const utils = api.useUtils();
    const { mutate: deleteMutation } = api.events.delete.useMutation({
        onSuccess: async () => {
            await utils.events.getAll.invalidate();
            toast.success("Event deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleDelete = (id: string): void => {
        deleteMutation(id);
    };

    // Get unique locations for filter
    const uniqueLocations = Array.from(new Set(events?.map(event => event.location) || []));

    // Filter events based on search query, date, location, and time range
    const filteredEvents = events?.filter(event => {
        const matchesSearch = searchQuery === '' || 
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDate = !dateFilter || 
            new Date(event.startDate).toDateString() === dateFilter.toDateString() ||
            new Date(event.endDate).toDateString() === dateFilter.toDateString();
        
        const matchesLocation = locationFilter === 'all' || locationFilter === '' || event.location === locationFilter;
        
        const now = new Date();
        let matchesTimeRange = true;
        if (timeRangeFilter === 'upcoming') {
            matchesTimeRange = new Date(event.endDate) >= now;
        } else if (timeRangeFilter === 'past') {
            matchesTimeRange = new Date(event.endDate) < now;
        }
            
        return matchesSearch && matchesDate && matchesLocation && matchesTimeRange;
    });

    // Function to truncate text to 2 lines
    const truncateText = (text: string, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const resetFilters = () => {
        setSearchQuery('');
        setDateFilter(undefined);
        setLocationFilter('');
        setTimeRangeFilter('all');
    };

    // Function to check if an event is active
    const isEventActive = (event: Event) => {
        const now = new Date();
        return new Date(event.startDate) <= now && new Date(event.endDate) >= now;
    };

    // Function to check if an event is upcoming
    const isEventUpcoming = (event: Event) => {
        const now = new Date();
        return new Date(event.startDate) > now;
    };

    return (
        <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Events</h1>
                    <Link href="/eventos/criar">
                        <Button>Add Event</Button>
                    </Link>
                </div>
            </header>
            <div className="p-6 pb-2 flex flex-wrap gap-4 border-b">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "justify-start text-left font-normal",
                                !dateFilter && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={setDateFilter}
                        />
                    </PopoverContent>
                </Popover>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All locations</SelectItem>
                        {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>
                                {location}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All events</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="past">Past events</SelectItem>
                    </SelectContent>
                </Select>
                {(searchQuery || dateFilter || locationFilter !== '' || timeRangeFilter !== 'all') && (
                    <Button variant="ghost" onClick={resetFilters}>
                        Clear filters
                    </Button>
                )}
            </div>
            <main className="p-6">
                {isLoading ? (
                    <div>Loading events...</div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Showing {filteredEvents?.length || 0} of {events?.length || 0} events
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents?.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.title}</TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <div className="line-clamp-2 text-sm">
                                                {truncateText(event.description)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                                <span>{event.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{format(new Date(event.startDate), "MMM d, yyyy")}</div>
                                                <div className="text-muted-foreground">
                                                    {format(new Date(event.startDate), "h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {isEventActive(event) ? (
                                                <Badge variant="default" className="bg-green-500">Active</Badge>
                                            ) : isEventUpcoming(event) ? (
                                                <Badge variant="outline" className="border-blue-500 text-blue-500">Upcoming</Badge>
                                            ) : (
                                                <Badge variant="secondary">Past</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" onClick={() => {
                                                                setViewEvent(event);
                                                                setViewEventOpen(true);
                                                            }}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>View details</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                
                                                <Dialog open={editingEvent == event && editOpen} onOpenChange={setEditOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="icon" onClick={() => setEditingEvent(event)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-h-[85vh] scroll-smooth overflow-scroll">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Event</DialogTitle>
                                                        </DialogHeader>
                                                        <EventForm
                                                            event={editingEvent ?? undefined}
                                                            handleSuccess={() => setEditingEvent(null)}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleDelete(event.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )}
            </main>

            {/* View event details dialog */}
            <Dialog open={viewEventOpen} onOpenChange={setViewEventOpen}>
                <DialogContent className="max-h-[85vh] scroll-smooth overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{viewEvent?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        {viewEvent?.imageUrl && (
                            <div className="flex justify-center">
                                <img 
                                    src={viewEvent.imageUrl} 
                                    alt={viewEvent.title} 
                                    className="max-h-[300px] object-contain rounded-md" 
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-semibold">Location</h3>
                                <p className="text-sm flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {viewEvent?.location}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Date & Time</h3>
                                <p className="text-sm mt-1">
                                    {viewEvent && format(new Date(viewEvent.startDate), "MMMM d, yyyy")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {viewEvent && `${format(new Date(viewEvent.startDate), "h:mm a")} - ${format(new Date(viewEvent.endDate), "h:mm a")}`}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Description</h3>
                            <div className="text-sm whitespace-pre-wrap">{viewEvent?.description}</div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    );
}