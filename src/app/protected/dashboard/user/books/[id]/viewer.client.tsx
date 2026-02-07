"use client";

import dynamic from "next/dynamic";

type Props = {
    bookId: string;
    title: string;
};

const BookViewer = dynamic(() => import("./viewer"), {
    ssr: false,
});

export default function BookViewerClient(props: Props) {
    return <BookViewer {...props} />;
}
