import { CalendarDays, Hash, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { formatDate } from "@/lib/utils";
import type { BookListItem } from "@/lib/data/books";

export function BookDetail({ book }: { book: BookListItem }) {
  const details = [
    { label: "ISBN", value: book.isbn ?? "—" },
    { label: "Author", value: book.author?.name ?? "Unknown author" },
    { label: "Subject", value: book.subject?.name ?? "—" },
    { label: "Semester", value: book.semester?.name ?? "—" },
    { label: "Strand", value: book.strand?.name ?? "—" },
    { label: "Year Level", value: book.year_level?.name ?? "—" },
  ];

  return (
    
      
        
      
      
        
          
            
          
          {book.title}
          
            {book.author?.name ?? "Unknown author"}
          
        

        {book.description ? (
          
            
              About this book
            
            {book.description}
          
        ) : null}

        
          {details.map((item) => (
            
              
              
                {item.label}
                {item.value}
              
            
          ))}
        

        

        
          
            Stock information
          
          
            
              
                {book.inventory?.total_stock ?? 0}
              
              Total
            
            
              
                {book.inventory?.available_stock ?? 0}
              
              Available
            
            
              
                {book.inventory?.issued_stock ?? 0}
              
              Issued
            
          
          
            
            Last inventory update:{" "}
            {formatDate(book.inventory?.updated_at, "MMM d, yyyy h:mm a")}
          
        
      
    
  );
}
