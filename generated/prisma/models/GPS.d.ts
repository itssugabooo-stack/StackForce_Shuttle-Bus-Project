import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model GPS
 *
 */
export type GPSModel = runtime.Types.Result.DefaultSelection<Prisma.$GPSPayload>;
export type AggregateGPS = {
    _count: GPSCountAggregateOutputType | null;
    _avg: GPSAvgAggregateOutputType | null;
    _sum: GPSSumAggregateOutputType | null;
    _min: GPSMinAggregateOutputType | null;
    _max: GPSMaxAggregateOutputType | null;
};
export type GPSAvgAggregateOutputType = {
    id: number | null;
    latitude: number | null;
    longitude: number | null;
    speed: number | null;
    heading: number | null;
    tripId: number | null;
};
export type GPSSumAggregateOutputType = {
    id: number | null;
    latitude: number | null;
    longitude: number | null;
    speed: number | null;
    heading: number | null;
    tripId: number | null;
};
export type GPSMinAggregateOutputType = {
    id: number | null;
    latitude: number | null;
    longitude: number | null;
    speed: number | null;
    heading: number | null;
    recordedAt: Date | null;
    tripId: number | null;
    createdAt: Date | null;
};
export type GPSMaxAggregateOutputType = {
    id: number | null;
    latitude: number | null;
    longitude: number | null;
    speed: number | null;
    heading: number | null;
    recordedAt: Date | null;
    tripId: number | null;
    createdAt: Date | null;
};
export type GPSCountAggregateOutputType = {
    id: number;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    recordedAt: number;
    tripId: number;
    createdAt: number;
    _all: number;
};
export type GPSAvgAggregateInputType = {
    id?: true;
    latitude?: true;
    longitude?: true;
    speed?: true;
    heading?: true;
    tripId?: true;
};
export type GPSSumAggregateInputType = {
    id?: true;
    latitude?: true;
    longitude?: true;
    speed?: true;
    heading?: true;
    tripId?: true;
};
export type GPSMinAggregateInputType = {
    id?: true;
    latitude?: true;
    longitude?: true;
    speed?: true;
    heading?: true;
    recordedAt?: true;
    tripId?: true;
    createdAt?: true;
};
export type GPSMaxAggregateInputType = {
    id?: true;
    latitude?: true;
    longitude?: true;
    speed?: true;
    heading?: true;
    recordedAt?: true;
    tripId?: true;
    createdAt?: true;
};
export type GPSCountAggregateInputType = {
    id?: true;
    latitude?: true;
    longitude?: true;
    speed?: true;
    heading?: true;
    recordedAt?: true;
    tripId?: true;
    createdAt?: true;
    _all?: true;
};
export type GPSAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GPS to aggregate.
     */
    where?: Prisma.GPSWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GPS to fetch.
     */
    orderBy?: Prisma.GPSOrderByWithRelationInput | Prisma.GPSOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.GPSWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GPS from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GPS.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned GPS
    **/
    _count?: true | GPSCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: GPSAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: GPSSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: GPSMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: GPSMaxAggregateInputType;
};
export type GetGPSAggregateType<T extends GPSAggregateArgs> = {
    [P in keyof T & keyof AggregateGPS]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGPS[P]> : Prisma.GetScalarType<T[P], AggregateGPS[P]>;
};
export type GPSGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GPSWhereInput;
    orderBy?: Prisma.GPSOrderByWithAggregationInput | Prisma.GPSOrderByWithAggregationInput[];
    by: Prisma.GPSScalarFieldEnum[] | Prisma.GPSScalarFieldEnum;
    having?: Prisma.GPSScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GPSCountAggregateInputType | true;
    _avg?: GPSAvgAggregateInputType;
    _sum?: GPSSumAggregateInputType;
    _min?: GPSMinAggregateInputType;
    _max?: GPSMaxAggregateInputType;
};
export type GPSGroupByOutputType = {
    id: number;
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
    recordedAt: Date;
    tripId: number;
    createdAt: Date;
    _count: GPSCountAggregateOutputType | null;
    _avg: GPSAvgAggregateOutputType | null;
    _sum: GPSSumAggregateOutputType | null;
    _min: GPSMinAggregateOutputType | null;
    _max: GPSMaxAggregateOutputType | null;
};
export type GetGPSGroupByPayload<T extends GPSGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GPSGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GPSGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GPSGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GPSGroupByOutputType[P]>;
}>>;
export type GPSWhereInput = {
    AND?: Prisma.GPSWhereInput | Prisma.GPSWhereInput[];
    OR?: Prisma.GPSWhereInput[];
    NOT?: Prisma.GPSWhereInput | Prisma.GPSWhereInput[];
    id?: Prisma.IntFilter<"GPS"> | number;
    latitude?: Prisma.FloatFilter<"GPS"> | number;
    longitude?: Prisma.FloatFilter<"GPS"> | number;
    speed?: Prisma.FloatNullableFilter<"GPS"> | number | null;
    heading?: Prisma.FloatNullableFilter<"GPS"> | number | null;
    recordedAt?: Prisma.DateTimeFilter<"GPS"> | Date | string;
    tripId?: Prisma.IntFilter<"GPS"> | number;
    createdAt?: Prisma.DateTimeFilter<"GPS"> | Date | string;
    trip?: Prisma.XOR<Prisma.TripScalarRelationFilter, Prisma.TripWhereInput>;
};
export type GPSOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    latitude?: Prisma.SortOrder;
    longitude?: Prisma.SortOrder;
    speed?: Prisma.SortOrderInput | Prisma.SortOrder;
    heading?: Prisma.SortOrderInput | Prisma.SortOrder;
    recordedAt?: Prisma.SortOrder;
    tripId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    trip?: Prisma.TripOrderByWithRelationInput;
};
export type GPSWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.GPSWhereInput | Prisma.GPSWhereInput[];
    OR?: Prisma.GPSWhereInput[];
    NOT?: Prisma.GPSWhereInput | Prisma.GPSWhereInput[];
    latitude?: Prisma.FloatFilter<"GPS"> | number;
    longitude?: Prisma.FloatFilter<"GPS"> | number;
    speed?: Prisma.FloatNullableFilter<"GPS"> | number | null;
    heading?: Prisma.FloatNullableFilter<"GPS"> | number | null;
    recordedAt?: Prisma.DateTimeFilter<"GPS"> | Date | string;
    tripId?: Prisma.IntFilter<"GPS"> | number;
    createdAt?: Prisma.DateTimeFilter<"GPS"> | Date | string;
    trip?: Prisma.XOR<Prisma.TripScalarRelationFilter, Prisma.TripWhereInput>;
}, "id">;
export type GPSOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    latitude?: Prisma.SortOrder;
    longitude?: Prisma.SortOrder;
    speed?: Prisma.SortOrderInput | Prisma.SortOrder;
    heading?: Prisma.SortOrderInput | Prisma.SortOrder;
    recordedAt?: Prisma.SortOrder;
    tripId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.GPSCountOrderByAggregateInput;
    _avg?: Prisma.GPSAvgOrderByAggregateInput;
    _max?: Prisma.GPSMaxOrderByAggregateInput;
    _min?: Prisma.GPSMinOrderByAggregateInput;
    _sum?: Prisma.GPSSumOrderByAggregateInput;
};
export type GPSScalarWhereWithAggregatesInput = {
    AND?: Prisma.GPSScalarWhereWithAggregatesInput | Prisma.GPSScalarWhereWithAggregatesInput[];
    OR?: Prisma.GPSScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GPSScalarWhereWithAggregatesInput | Prisma.GPSScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"GPS"> | number;
    latitude?: Prisma.FloatWithAggregatesFilter<"GPS"> | number;
    longitude?: Prisma.FloatWithAggregatesFilter<"GPS"> | number;
    speed?: Prisma.FloatNullableWithAggregatesFilter<"GPS"> | number | null;
    heading?: Prisma.FloatNullableWithAggregatesFilter<"GPS"> | number | null;
    recordedAt?: Prisma.DateTimeWithAggregatesFilter<"GPS"> | Date | string;
    tripId?: Prisma.IntWithAggregatesFilter<"GPS"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"GPS"> | Date | string;
};
export type GPSCreateInput = {
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
    recordedAt?: Date | string;
    createdAt?: Date | string;
    trip: Prisma.TripCreateNestedOneWithoutGpsPointsInput;
};
export type GPSUncheckedCreateInput = {
    id?: number;
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
    recordedAt?: Date | string;
    tripId: number;
    createdAt?: Date | string;
};
export type GPSUpdateInput = {
    latitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    longitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    speed?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heading?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    recordedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    trip?: Prisma.TripUpdateOneRequiredWithoutGpsPointsNestedInput;
};
export type GPSUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    latitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    longitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    speed?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heading?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    recordedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tripId?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GPSCreateManyInput = {
    id?: number;
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
    recordedAt?: Date | string;
    tripId: number;
    createdAt?: Date | string;
};
export type GPSUpdateManyMutationInput = {
    latitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    longitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    speed?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heading?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    recordedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GPSUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    latitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    longitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    speed?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heading?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    recordedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tripId?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GPSListRelationFilter = {
    every?: Prisma.GPSWhereInput;
    some?: Prisma.GPSWhereInput;
    none?: Prisma.GPSWhereInput;
};
export type GPSOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type GPSCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    latitude?: Prisma.SortOrder;
    longitude?: Prisma.SortOrder;
    speed?: Prisma.SortOrder;
    heading?: Prisma.SortOrder;
    recordedAt?: Prisma.SortOrder;
    tripId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type GPSAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    latitude?: Prisma.SortOrder;
    longitude?: Prisma.SortOrder;
    speed?: Prisma.SortOrder;
    heading?: Prisma.SortOrder;
    tripId?: Prisma.SortOrder;
};
export type GPSMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    latitude?: Prisma.SortOrder;
    longitude?: Prisma.SortOrder;
    speed?: Prisma.SortOrder;
    heading?: Prisma.SortOrder;
    recordedAt?: Prisma.SortOrder;
    tripId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type GPSMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    latitude?: Prisma.SortOrder;
    longitude?: Prisma.SortOrder;
    speed?: Prisma.SortOrder;
    heading?: Prisma.SortOrder;
    recordedAt?: Prisma.SortOrder;
    tripId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type GPSSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    latitude?: Prisma.SortOrder;
    longitude?: Prisma.SortOrder;
    speed?: Prisma.SortOrder;
    heading?: Prisma.SortOrder;
    tripId?: Prisma.SortOrder;
};
export type GPSCreateNestedManyWithoutTripInput = {
    create?: Prisma.XOR<Prisma.GPSCreateWithoutTripInput, Prisma.GPSUncheckedCreateWithoutTripInput> | Prisma.GPSCreateWithoutTripInput[] | Prisma.GPSUncheckedCreateWithoutTripInput[];
    connectOrCreate?: Prisma.GPSCreateOrConnectWithoutTripInput | Prisma.GPSCreateOrConnectWithoutTripInput[];
    createMany?: Prisma.GPSCreateManyTripInputEnvelope;
    connect?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
};
export type GPSUncheckedCreateNestedManyWithoutTripInput = {
    create?: Prisma.XOR<Prisma.GPSCreateWithoutTripInput, Prisma.GPSUncheckedCreateWithoutTripInput> | Prisma.GPSCreateWithoutTripInput[] | Prisma.GPSUncheckedCreateWithoutTripInput[];
    connectOrCreate?: Prisma.GPSCreateOrConnectWithoutTripInput | Prisma.GPSCreateOrConnectWithoutTripInput[];
    createMany?: Prisma.GPSCreateManyTripInputEnvelope;
    connect?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
};
export type GPSUpdateManyWithoutTripNestedInput = {
    create?: Prisma.XOR<Prisma.GPSCreateWithoutTripInput, Prisma.GPSUncheckedCreateWithoutTripInput> | Prisma.GPSCreateWithoutTripInput[] | Prisma.GPSUncheckedCreateWithoutTripInput[];
    connectOrCreate?: Prisma.GPSCreateOrConnectWithoutTripInput | Prisma.GPSCreateOrConnectWithoutTripInput[];
    upsert?: Prisma.GPSUpsertWithWhereUniqueWithoutTripInput | Prisma.GPSUpsertWithWhereUniqueWithoutTripInput[];
    createMany?: Prisma.GPSCreateManyTripInputEnvelope;
    set?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
    disconnect?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
    delete?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
    connect?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
    update?: Prisma.GPSUpdateWithWhereUniqueWithoutTripInput | Prisma.GPSUpdateWithWhereUniqueWithoutTripInput[];
    updateMany?: Prisma.GPSUpdateManyWithWhereWithoutTripInput | Prisma.GPSUpdateManyWithWhereWithoutTripInput[];
    deleteMany?: Prisma.GPSScalarWhereInput | Prisma.GPSScalarWhereInput[];
};
export type GPSUncheckedUpdateManyWithoutTripNestedInput = {
    create?: Prisma.XOR<Prisma.GPSCreateWithoutTripInput, Prisma.GPSUncheckedCreateWithoutTripInput> | Prisma.GPSCreateWithoutTripInput[] | Prisma.GPSUncheckedCreateWithoutTripInput[];
    connectOrCreate?: Prisma.GPSCreateOrConnectWithoutTripInput | Prisma.GPSCreateOrConnectWithoutTripInput[];
    upsert?: Prisma.GPSUpsertWithWhereUniqueWithoutTripInput | Prisma.GPSUpsertWithWhereUniqueWithoutTripInput[];
    createMany?: Prisma.GPSCreateManyTripInputEnvelope;
    set?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
    disconnect?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
    delete?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
    connect?: Prisma.GPSWhereUniqueInput | Prisma.GPSWhereUniqueInput[];
    update?: Prisma.GPSUpdateWithWhereUniqueWithoutTripInput | Prisma.GPSUpdateWithWhereUniqueWithoutTripInput[];
    updateMany?: Prisma.GPSUpdateManyWithWhereWithoutTripInput | Prisma.GPSUpdateManyWithWhereWithoutTripInput[];
    deleteMany?: Prisma.GPSScalarWhereInput | Prisma.GPSScalarWhereInput[];
};
export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type GPSCreateWithoutTripInput = {
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
    recordedAt?: Date | string;
    createdAt?: Date | string;
};
export type GPSUncheckedCreateWithoutTripInput = {
    id?: number;
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
    recordedAt?: Date | string;
    createdAt?: Date | string;
};
export type GPSCreateOrConnectWithoutTripInput = {
    where: Prisma.GPSWhereUniqueInput;
    create: Prisma.XOR<Prisma.GPSCreateWithoutTripInput, Prisma.GPSUncheckedCreateWithoutTripInput>;
};
export type GPSCreateManyTripInputEnvelope = {
    data: Prisma.GPSCreateManyTripInput | Prisma.GPSCreateManyTripInput[];
    skipDuplicates?: boolean;
};
export type GPSUpsertWithWhereUniqueWithoutTripInput = {
    where: Prisma.GPSWhereUniqueInput;
    update: Prisma.XOR<Prisma.GPSUpdateWithoutTripInput, Prisma.GPSUncheckedUpdateWithoutTripInput>;
    create: Prisma.XOR<Prisma.GPSCreateWithoutTripInput, Prisma.GPSUncheckedCreateWithoutTripInput>;
};
export type GPSUpdateWithWhereUniqueWithoutTripInput = {
    where: Prisma.GPSWhereUniqueInput;
    data: Prisma.XOR<Prisma.GPSUpdateWithoutTripInput, Prisma.GPSUncheckedUpdateWithoutTripInput>;
};
export type GPSUpdateManyWithWhereWithoutTripInput = {
    where: Prisma.GPSScalarWhereInput;
    data: Prisma.XOR<Prisma.GPSUpdateManyMutationInput, Prisma.GPSUncheckedUpdateManyWithoutTripInput>;
};
export type GPSScalarWhereInput = {
    AND?: Prisma.GPSScalarWhereInput | Prisma.GPSScalarWhereInput[];
    OR?: Prisma.GPSScalarWhereInput[];
    NOT?: Prisma.GPSScalarWhereInput | Prisma.GPSScalarWhereInput[];
    id?: Prisma.IntFilter<"GPS"> | number;
    latitude?: Prisma.FloatFilter<"GPS"> | number;
    longitude?: Prisma.FloatFilter<"GPS"> | number;
    speed?: Prisma.FloatNullableFilter<"GPS"> | number | null;
    heading?: Prisma.FloatNullableFilter<"GPS"> | number | null;
    recordedAt?: Prisma.DateTimeFilter<"GPS"> | Date | string;
    tripId?: Prisma.IntFilter<"GPS"> | number;
    createdAt?: Prisma.DateTimeFilter<"GPS"> | Date | string;
};
export type GPSCreateManyTripInput = {
    id?: number;
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
    recordedAt?: Date | string;
    createdAt?: Date | string;
};
export type GPSUpdateWithoutTripInput = {
    latitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    longitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    speed?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heading?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    recordedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GPSUncheckedUpdateWithoutTripInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    latitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    longitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    speed?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heading?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    recordedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GPSUncheckedUpdateManyWithoutTripInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    latitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    longitude?: Prisma.FloatFieldUpdateOperationsInput | number;
    speed?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    heading?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    recordedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GPSSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    latitude?: boolean;
    longitude?: boolean;
    speed?: boolean;
    heading?: boolean;
    recordedAt?: boolean;
    tripId?: boolean;
    createdAt?: boolean;
    trip?: boolean | Prisma.TripDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["gPS"]>;
export type GPSSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    latitude?: boolean;
    longitude?: boolean;
    speed?: boolean;
    heading?: boolean;
    recordedAt?: boolean;
    tripId?: boolean;
    createdAt?: boolean;
    trip?: boolean | Prisma.TripDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["gPS"]>;
export type GPSSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    latitude?: boolean;
    longitude?: boolean;
    speed?: boolean;
    heading?: boolean;
    recordedAt?: boolean;
    tripId?: boolean;
    createdAt?: boolean;
    trip?: boolean | Prisma.TripDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["gPS"]>;
export type GPSSelectScalar = {
    id?: boolean;
    latitude?: boolean;
    longitude?: boolean;
    speed?: boolean;
    heading?: boolean;
    recordedAt?: boolean;
    tripId?: boolean;
    createdAt?: boolean;
};
export type GPSOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "latitude" | "longitude" | "speed" | "heading" | "recordedAt" | "tripId" | "createdAt", ExtArgs["result"]["gPS"]>;
export type GPSInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trip?: boolean | Prisma.TripDefaultArgs<ExtArgs>;
};
export type GPSIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trip?: boolean | Prisma.TripDefaultArgs<ExtArgs>;
};
export type GPSIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trip?: boolean | Prisma.TripDefaultArgs<ExtArgs>;
};
export type $GPSPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GPS";
    objects: {
        trip: Prisma.$TripPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        latitude: number;
        longitude: number;
        speed: number | null;
        heading: number | null;
        recordedAt: Date;
        tripId: number;
        createdAt: Date;
    }, ExtArgs["result"]["gPS"]>;
    composites: {};
};
export type GPSGetPayload<S extends boolean | null | undefined | GPSDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GPSPayload, S>;
export type GPSCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GPSFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GPSCountAggregateInputType | true;
};
export interface GPSDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GPS'];
        meta: {
            name: 'GPS';
        };
    };
    /**
     * Find zero or one GPS that matches the filter.
     * @param {GPSFindUniqueArgs} args - Arguments to find a GPS
     * @example
     * // Get one GPS
     * const gPS = await prisma.gPS.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GPSFindUniqueArgs>(args: Prisma.SelectSubset<T, GPSFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GPSClient<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one GPS that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GPSFindUniqueOrThrowArgs} args - Arguments to find a GPS
     * @example
     * // Get one GPS
     * const gPS = await prisma.gPS.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GPSFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GPSFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GPSClient<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GPS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GPSFindFirstArgs} args - Arguments to find a GPS
     * @example
     * // Get one GPS
     * const gPS = await prisma.gPS.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GPSFindFirstArgs>(args?: Prisma.SelectSubset<T, GPSFindFirstArgs<ExtArgs>>): Prisma.Prisma__GPSClient<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GPS that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GPSFindFirstOrThrowArgs} args - Arguments to find a GPS
     * @example
     * // Get one GPS
     * const gPS = await prisma.gPS.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GPSFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GPSFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GPSClient<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more GPS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GPSFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GPS
     * const gPS = await prisma.gPS.findMany()
     *
     * // Get first 10 GPS
     * const gPS = await prisma.gPS.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const gPSWithIdOnly = await prisma.gPS.findMany({ select: { id: true } })
     *
     */
    findMany<T extends GPSFindManyArgs>(args?: Prisma.SelectSubset<T, GPSFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a GPS.
     * @param {GPSCreateArgs} args - Arguments to create a GPS.
     * @example
     * // Create one GPS
     * const GPS = await prisma.gPS.create({
     *   data: {
     *     // ... data to create a GPS
     *   }
     * })
     *
     */
    create<T extends GPSCreateArgs>(args: Prisma.SelectSubset<T, GPSCreateArgs<ExtArgs>>): Prisma.Prisma__GPSClient<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many GPS.
     * @param {GPSCreateManyArgs} args - Arguments to create many GPS.
     * @example
     * // Create many GPS
     * const gPS = await prisma.gPS.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends GPSCreateManyArgs>(args?: Prisma.SelectSubset<T, GPSCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many GPS and returns the data saved in the database.
     * @param {GPSCreateManyAndReturnArgs} args - Arguments to create many GPS.
     * @example
     * // Create many GPS
     * const gPS = await prisma.gPS.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many GPS and only return the `id`
     * const gPSWithIdOnly = await prisma.gPS.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends GPSCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, GPSCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a GPS.
     * @param {GPSDeleteArgs} args - Arguments to delete one GPS.
     * @example
     * // Delete one GPS
     * const GPS = await prisma.gPS.delete({
     *   where: {
     *     // ... filter to delete one GPS
     *   }
     * })
     *
     */
    delete<T extends GPSDeleteArgs>(args: Prisma.SelectSubset<T, GPSDeleteArgs<ExtArgs>>): Prisma.Prisma__GPSClient<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one GPS.
     * @param {GPSUpdateArgs} args - Arguments to update one GPS.
     * @example
     * // Update one GPS
     * const gPS = await prisma.gPS.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends GPSUpdateArgs>(args: Prisma.SelectSubset<T, GPSUpdateArgs<ExtArgs>>): Prisma.Prisma__GPSClient<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more GPS.
     * @param {GPSDeleteManyArgs} args - Arguments to filter GPS to delete.
     * @example
     * // Delete a few GPS
     * const { count } = await prisma.gPS.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends GPSDeleteManyArgs>(args?: Prisma.SelectSubset<T, GPSDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GPSUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GPS
     * const gPS = await prisma.gPS.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends GPSUpdateManyArgs>(args: Prisma.SelectSubset<T, GPSUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GPS and returns the data updated in the database.
     * @param {GPSUpdateManyAndReturnArgs} args - Arguments to update many GPS.
     * @example
     * // Update many GPS
     * const gPS = await prisma.gPS.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more GPS and only return the `id`
     * const gPSWithIdOnly = await prisma.gPS.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends GPSUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, GPSUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one GPS.
     * @param {GPSUpsertArgs} args - Arguments to update or create a GPS.
     * @example
     * // Update or create a GPS
     * const gPS = await prisma.gPS.upsert({
     *   create: {
     *     // ... data to create a GPS
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GPS we want to update
     *   }
     * })
     */
    upsert<T extends GPSUpsertArgs>(args: Prisma.SelectSubset<T, GPSUpsertArgs<ExtArgs>>): Prisma.Prisma__GPSClient<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of GPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GPSCountArgs} args - Arguments to filter GPS to count.
     * @example
     * // Count the number of GPS
     * const count = await prisma.gPS.count({
     *   where: {
     *     // ... the filter for the GPS we want to count
     *   }
     * })
    **/
    count<T extends GPSCountArgs>(args?: Prisma.Subset<T, GPSCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GPSCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a GPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GPSAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GPSAggregateArgs>(args: Prisma.Subset<T, GPSAggregateArgs>): Prisma.PrismaPromise<GetGPSAggregateType<T>>;
    /**
     * Group by GPS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GPSGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends GPSGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GPSGroupByArgs['orderBy'];
    } : {
        orderBy?: GPSGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GPSGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGPSGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the GPS model
     */
    readonly fields: GPSFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for GPS.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__GPSClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    trip<T extends Prisma.TripDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TripDefaultArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the GPS model
 */
export interface GPSFieldRefs {
    readonly id: Prisma.FieldRef<"GPS", 'Int'>;
    readonly latitude: Prisma.FieldRef<"GPS", 'Float'>;
    readonly longitude: Prisma.FieldRef<"GPS", 'Float'>;
    readonly speed: Prisma.FieldRef<"GPS", 'Float'>;
    readonly heading: Prisma.FieldRef<"GPS", 'Float'>;
    readonly recordedAt: Prisma.FieldRef<"GPS", 'DateTime'>;
    readonly tripId: Prisma.FieldRef<"GPS", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"GPS", 'DateTime'>;
}
/**
 * GPS findUnique
 */
export type GPSFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * Filter, which GPS to fetch.
     */
    where: Prisma.GPSWhereUniqueInput;
};
/**
 * GPS findUniqueOrThrow
 */
export type GPSFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * Filter, which GPS to fetch.
     */
    where: Prisma.GPSWhereUniqueInput;
};
/**
 * GPS findFirst
 */
export type GPSFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * Filter, which GPS to fetch.
     */
    where?: Prisma.GPSWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GPS to fetch.
     */
    orderBy?: Prisma.GPSOrderByWithRelationInput | Prisma.GPSOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GPS.
     */
    cursor?: Prisma.GPSWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GPS from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GPS.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GPS.
     */
    distinct?: Prisma.GPSScalarFieldEnum | Prisma.GPSScalarFieldEnum[];
};
/**
 * GPS findFirstOrThrow
 */
export type GPSFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * Filter, which GPS to fetch.
     */
    where?: Prisma.GPSWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GPS to fetch.
     */
    orderBy?: Prisma.GPSOrderByWithRelationInput | Prisma.GPSOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GPS.
     */
    cursor?: Prisma.GPSWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GPS from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GPS.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GPS.
     */
    distinct?: Prisma.GPSScalarFieldEnum | Prisma.GPSScalarFieldEnum[];
};
/**
 * GPS findMany
 */
export type GPSFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * Filter, which GPS to fetch.
     */
    where?: Prisma.GPSWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GPS to fetch.
     */
    orderBy?: Prisma.GPSOrderByWithRelationInput | Prisma.GPSOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing GPS.
     */
    cursor?: Prisma.GPSWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GPS from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GPS.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GPS.
     */
    distinct?: Prisma.GPSScalarFieldEnum | Prisma.GPSScalarFieldEnum[];
};
/**
 * GPS create
 */
export type GPSCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * The data needed to create a GPS.
     */
    data: Prisma.XOR<Prisma.GPSCreateInput, Prisma.GPSUncheckedCreateInput>;
};
/**
 * GPS createMany
 */
export type GPSCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many GPS.
     */
    data: Prisma.GPSCreateManyInput | Prisma.GPSCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GPS createManyAndReturn
 */
export type GPSCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * The data used to create many GPS.
     */
    data: Prisma.GPSCreateManyInput | Prisma.GPSCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * GPS update
 */
export type GPSUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * The data needed to update a GPS.
     */
    data: Prisma.XOR<Prisma.GPSUpdateInput, Prisma.GPSUncheckedUpdateInput>;
    /**
     * Choose, which GPS to update.
     */
    where: Prisma.GPSWhereUniqueInput;
};
/**
 * GPS updateMany
 */
export type GPSUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update GPS.
     */
    data: Prisma.XOR<Prisma.GPSUpdateManyMutationInput, Prisma.GPSUncheckedUpdateManyInput>;
    /**
     * Filter which GPS to update
     */
    where?: Prisma.GPSWhereInput;
    /**
     * Limit how many GPS to update.
     */
    limit?: number;
};
/**
 * GPS updateManyAndReturn
 */
export type GPSUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * The data used to update GPS.
     */
    data: Prisma.XOR<Prisma.GPSUpdateManyMutationInput, Prisma.GPSUncheckedUpdateManyInput>;
    /**
     * Filter which GPS to update
     */
    where?: Prisma.GPSWhereInput;
    /**
     * Limit how many GPS to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * GPS upsert
 */
export type GPSUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * The filter to search for the GPS to update in case it exists.
     */
    where: Prisma.GPSWhereUniqueInput;
    /**
     * In case the GPS found by the `where` argument doesn't exist, create a new GPS with this data.
     */
    create: Prisma.XOR<Prisma.GPSCreateInput, Prisma.GPSUncheckedCreateInput>;
    /**
     * In case the GPS was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.GPSUpdateInput, Prisma.GPSUncheckedUpdateInput>;
};
/**
 * GPS delete
 */
export type GPSDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
    /**
     * Filter which GPS to delete.
     */
    where: Prisma.GPSWhereUniqueInput;
};
/**
 * GPS deleteMany
 */
export type GPSDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GPS to delete
     */
    where?: Prisma.GPSWhereInput;
    /**
     * Limit how many GPS to delete.
     */
    limit?: number;
};
/**
 * GPS without action
 */
export type GPSDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GPS
     */
    select?: Prisma.GPSSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GPS
     */
    omit?: Prisma.GPSOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GPSInclude<ExtArgs> | null;
};
//# sourceMappingURL=GPS.d.ts.map