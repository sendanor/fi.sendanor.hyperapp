// Copyright (c) 2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReactNode } from "react";

export interface HyperRoute {
    readonly path: string;
    readonly language?: string;
    readonly publicUrl?: string;
    readonly redirect?: string;
    readonly view?: ReactNode;
}
