import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model Trip
 *
 */
export type TripModel = runtime.Types.Result.DefaultSelection<Prisma.$TripPayload>;
export type AggregateTrip = {
    _count: TripCountAggregateOutputType | null;
    _avg: TripAvgAggregateOutputType | null;
    _sum: TripSumAggregateOutputType | null;
    _min: TripMinAggregateOutputType | null;
    _max: TripMaxAggregateOutputType | null;
};
export type TripAvgAggregateOutputType = {
    id: number | null;
    userId: number | null;
    tramId: number | null;
    routeId: number | null;
    sourceId: number | null;
};
export type TripSumAggregateOutputType = {
    id: number | null;
    userId: number | null;
    tramId: number | null;
    routeId: number | null;
    sourceId: number | null;
};
export type TripMinAggregateOutputType = {
    id: number | null;
    startedAt: Date | null;
    endedAt: Date | null;
    status: string | null;
    userId: number | null;
    tramId: number | null;
    routeId: number | null;
    sourceId: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TripMaxAggregateOutputType = {
    id: number | null;
    startedAt: Date | null;
    endedAt: Date | null;
    status: string | null;
    userId: number | null;
    tramId: number | null;
    routeId: number | null;
    sourceId: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TripCountAggregateOutputType = {
    id: number;
    startedAt: number;
    endedAt: number;
    status: number;
    userId: number;
    tramId: number;
    routeId: number;
    sourceId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TripAvgAggregateInputType = {
    id?: true;
    userId?: true;
    tramId?: true;
    routeId?: true;
    sourceId?: true;
};
export type TripSumAggregateInputType = {
    id?: true;
    userId?: true;
    tramId?: true;
    routeId?: true;
    sourceId?: true;
};
export type TripMinAggregateInputType = {
    id?: true;
    startedAt?: true;
    endedAt?: true;
    status?: true;
    userId?: true;
    tramId?: true;
    routeId?: true;
    sourceId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TripMaxAggregateInputType = {
    id?: true;
    startedAt?: true;
    endedAt?: true;
    status?: true;
    userId?: true;
    tramId?: true;
    routeId?: true;
    sourceId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TripCountAggregateInputType = {
    id?: true;
    startedAt?: true;
    endedAt?: true;
    status?: true;
    userId?: true;
    tramId?: true;
    routeId?: true;
    sourceId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TripAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Trip to aggregate.
     */
    where?: Prisma.TripWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Trips to fetch.
     */
    orderBy?: Prisma.TripOrderByWithRelationInput | Prisma.TripOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.TripWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Trips from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Trips.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Trips
    **/
    _count?: true | TripCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: TripAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: TripSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: TripMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: TripMaxAggregateInputType;
};
export type GetTripAggregateType<T extends TripAggregateArgs> = {
    [P in keyof T & keyof AggregateTrip]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTrip[P]> : Prisma.GetScalarType<T[P], AggregateTrip[P]>;
};
export type TripGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithAggregationInput | Prisma.TripOrderByWithAggregationInput[];
    by: Prisma.TripScalarFieldEnum[] | Prisma.TripScalarFieldEnum;
    having?: Prisma.TripScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TripCountAggregateInputType | true;
    _avg?: TripAvgAggregateInputType;
    _sum?: TripSumAggregateInputType;
    _min?: TripMinAggregateInputType;
    _max?: TripMaxAggregateInputType;
};
export type TripGroupByOutputType = {
    id: number;
    startedAt: Date;
    endedAt: Date | null;
    status: string;
    userId: number | null;
    tramId: number;
    routeId: number;
    sourceId: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TripCountAggregateOutputType | null;
    _avg: TripAvgAggregateOutputType | null;
    _sum: TripSumAggregateOutputType | null;
    _min: TripMinAggregateOutputType | null;
    _max: TripMaxAggregateOutputType | null;
};
export type GetTripGroupByPayload<T extends TripGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TripGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TripGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TripGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TripGroupByOutputType[P]>;
}>>;
export type TripWhereInput = {
    AND?: Prisma.TripWhereInput | Prisma.TripWhereInput[];
    OR?: Prisma.TripWhereInput[];
    NOT?: Prisma.TripWhereInput | Prisma.TripWhereInput[];
    id?: Prisma.IntFilter<"Trip"> | number;
    startedAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
    endedAt?: Prisma.DateTimeNullableFilter<"Trip"> | Date | string | null;
    status?: Prisma.StringFilter<"Trip"> | string;
    userId?: Prisma.IntNullableFilter<"Trip"> | number | null;
    tramId?: Prisma.IntFilter<"Trip"> | number;
    routeId?: Prisma.IntFilter<"Trip"> | number;
    sourceId?: Prisma.IntNullableFilter<"Trip"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    tram?: Prisma.XOR<Prisma.TramScalarRelationFilter, Prisma.TramWhereInput>;
    route?: Prisma.XOR<Prisma.RouteScalarRelationFilter, Prisma.RouteWhereInput>;
    source?: Prisma.XOR<Prisma.SourceNullableScalarRelationFilter, Prisma.SourceWhereInput> | null;
    gpsPoints?: Prisma.GPSListRelationFilter;
};
export type TripOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    tramId?: Prisma.SortOrder;
    routeId?: Prisma.SortOrder;
    sourceId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    tram?: Prisma.TramOrderByWithRelationInput;
    route?: Prisma.RouteOrderByWithRelationInput;
    source?: Prisma.SourceOrderByWithRelationInput;
    gpsPoints?: Prisma.GPSOrderByRelationAggregateInput;
};
export type TripWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.TripWhereInput | Prisma.TripWhereInput[];
    OR?: Prisma.TripWhereInput[];
    NOT?: Prisma.TripWhereInput | Prisma.TripWhereInput[];
    startedAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
    endedAt?: Prisma.DateTimeNullableFilter<"Trip"> | Date | string | null;
    status?: Prisma.StringFilter<"Trip"> | string;
    userId?: Prisma.IntNullableFilter<"Trip"> | number | null;
    tramId?: Prisma.IntFilter<"Trip"> | number;
    routeId?: Prisma.IntFilter<"Trip"> | number;
    sourceId?: Prisma.IntNullableFilter<"Trip"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    tram?: Prisma.XOR<Prisma.TramScalarRelationFilter, Prisma.TramWhereInput>;
    route?: Prisma.XOR<Prisma.RouteScalarRelationFilter, Prisma.RouteWhereInput>;
    source?: Prisma.XOR<Prisma.SourceNullableScalarRelationFilter, Prisma.SourceWhereInput> | null;
    gpsPoints?: Prisma.GPSListRelationFilter;
}, "id">;
export type TripOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    tramId?: Prisma.SortOrder;
    routeId?: Prisma.SortOrder;
    sourceId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TripCountOrderByAggregateInput;
    _avg?: Prisma.TripAvgOrderByAggregateInput;
    _max?: Prisma.TripMaxOrderByAggregateInput;
    _min?: Prisma.TripMinOrderByAggregateInput;
    _sum?: Prisma.TripSumOrderByAggregateInput;
};
export type TripScalarWhereWithAggregatesInput = {
    AND?: Prisma.TripScalarWhereWithAggregatesInput | Prisma.TripScalarWhereWithAggregatesInput[];
    OR?: Prisma.TripScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TripScalarWhereWithAggregatesInput | Prisma.TripScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Trip"> | number;
    startedAt?: Prisma.DateTimeWithAggregatesFilter<"Trip"> | Date | string;
    endedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Trip"> | Date | string | null;
    status?: Prisma.StringWithAggregatesFilter<"Trip"> | string;
    userId?: Prisma.IntNullableWithAggregatesFilter<"Trip"> | number | null;
    tramId?: Prisma.IntWithAggregatesFilter<"Trip"> | number;
    routeId?: Prisma.IntWithAggregatesFilter<"Trip"> | number;
    sourceId?: Prisma.IntNullableWithAggregatesFilter<"Trip"> | number | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Trip"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Trip"> | Date | string;
};
export type TripCreateInput = {
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutTripsInput;
    tram: Prisma.TramCreateNestedOneWithoutTripsInput;
    route: Prisma.RouteCreateNestedOneWithoutTripsInput;
    source?: Prisma.SourceCreateNestedOneWithoutTripsInput;
    gpsPoints?: Prisma.GPSCreateNestedManyWithoutTripInput;
};
export type TripUncheckedCreateInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    tramId: number;
    routeId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    gpsPoints?: Prisma.GPSUncheckedCreateNestedManyWithoutTripInput;
};
export type TripUpdateInput = {
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutTripsNestedInput;
    tram?: Prisma.TramUpdateOneRequiredWithoutTripsNestedInput;
    route?: Prisma.RouteUpdateOneRequiredWithoutTripsNestedInput;
    source?: Prisma.SourceUpdateOneWithoutTripsNestedInput;
    gpsPoints?: Prisma.GPSUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    gpsPoints?: Prisma.GPSUncheckedUpdateManyWithoutTripNestedInput;
};
export type TripCreateManyInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    tramId: number;
    routeId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TripUpdateManyMutationInput = {
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TripUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TripListRelationFilter = {
    every?: Prisma.TripWhereInput;
    some?: Prisma.TripWhereInput;
    none?: Prisma.TripWhereInput;
};
export type TripOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TripCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tramId?: Prisma.SortOrder;
    routeId?: Prisma.SortOrder;
    sourceId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TripAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tramId?: Prisma.SortOrder;
    routeId?: Prisma.SortOrder;
    sourceId?: Prisma.SortOrder;
};
export type TripMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tramId?: Prisma.SortOrder;
    routeId?: Prisma.SortOrder;
    sourceId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TripMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tramId?: Prisma.SortOrder;
    routeId?: Prisma.SortOrder;
    sourceId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TripSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tramId?: Prisma.SortOrder;
    routeId?: Prisma.SortOrder;
    sourceId?: Prisma.SortOrder;
};
export type TripScalarRelationFilter = {
    is?: Prisma.TripWhereInput;
    isNot?: Prisma.TripWhereInput;
};
export type TripCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutUserInput, Prisma.TripUncheckedCreateWithoutUserInput> | Prisma.TripCreateWithoutUserInput[] | Prisma.TripUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutUserInput | Prisma.TripCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.TripCreateManyUserInputEnvelope;
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
};
export type TripUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutUserInput, Prisma.TripUncheckedCreateWithoutUserInput> | Prisma.TripCreateWithoutUserInput[] | Prisma.TripUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutUserInput | Prisma.TripCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.TripCreateManyUserInputEnvelope;
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
};
export type TripUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutUserInput, Prisma.TripUncheckedCreateWithoutUserInput> | Prisma.TripCreateWithoutUserInput[] | Prisma.TripUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutUserInput | Prisma.TripCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.TripUpsertWithWhereUniqueWithoutUserInput | Prisma.TripUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.TripCreateManyUserInputEnvelope;
    set?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    disconnect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    delete?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    update?: Prisma.TripUpdateWithWhereUniqueWithoutUserInput | Prisma.TripUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.TripUpdateManyWithWhereWithoutUserInput | Prisma.TripUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
};
export type TripUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutUserInput, Prisma.TripUncheckedCreateWithoutUserInput> | Prisma.TripCreateWithoutUserInput[] | Prisma.TripUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutUserInput | Prisma.TripCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.TripUpsertWithWhereUniqueWithoutUserInput | Prisma.TripUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.TripCreateManyUserInputEnvelope;
    set?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    disconnect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    delete?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    update?: Prisma.TripUpdateWithWhereUniqueWithoutUserInput | Prisma.TripUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.TripUpdateManyWithWhereWithoutUserInput | Prisma.TripUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
};
export type TripCreateNestedManyWithoutTramInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutTramInput, Prisma.TripUncheckedCreateWithoutTramInput> | Prisma.TripCreateWithoutTramInput[] | Prisma.TripUncheckedCreateWithoutTramInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutTramInput | Prisma.TripCreateOrConnectWithoutTramInput[];
    createMany?: Prisma.TripCreateManyTramInputEnvelope;
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
};
export type TripUncheckedCreateNestedManyWithoutTramInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutTramInput, Prisma.TripUncheckedCreateWithoutTramInput> | Prisma.TripCreateWithoutTramInput[] | Prisma.TripUncheckedCreateWithoutTramInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutTramInput | Prisma.TripCreateOrConnectWithoutTramInput[];
    createMany?: Prisma.TripCreateManyTramInputEnvelope;
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
};
export type TripUpdateManyWithoutTramNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutTramInput, Prisma.TripUncheckedCreateWithoutTramInput> | Prisma.TripCreateWithoutTramInput[] | Prisma.TripUncheckedCreateWithoutTramInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutTramInput | Prisma.TripCreateOrConnectWithoutTramInput[];
    upsert?: Prisma.TripUpsertWithWhereUniqueWithoutTramInput | Prisma.TripUpsertWithWhereUniqueWithoutTramInput[];
    createMany?: Prisma.TripCreateManyTramInputEnvelope;
    set?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    disconnect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    delete?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    update?: Prisma.TripUpdateWithWhereUniqueWithoutTramInput | Prisma.TripUpdateWithWhereUniqueWithoutTramInput[];
    updateMany?: Prisma.TripUpdateManyWithWhereWithoutTramInput | Prisma.TripUpdateManyWithWhereWithoutTramInput[];
    deleteMany?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
};
export type TripUncheckedUpdateManyWithoutTramNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutTramInput, Prisma.TripUncheckedCreateWithoutTramInput> | Prisma.TripCreateWithoutTramInput[] | Prisma.TripUncheckedCreateWithoutTramInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutTramInput | Prisma.TripCreateOrConnectWithoutTramInput[];
    upsert?: Prisma.TripUpsertWithWhereUniqueWithoutTramInput | Prisma.TripUpsertWithWhereUniqueWithoutTramInput[];
    createMany?: Prisma.TripCreateManyTramInputEnvelope;
    set?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    disconnect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    delete?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    update?: Prisma.TripUpdateWithWhereUniqueWithoutTramInput | Prisma.TripUpdateWithWhereUniqueWithoutTramInput[];
    updateMany?: Prisma.TripUpdateManyWithWhereWithoutTramInput | Prisma.TripUpdateManyWithWhereWithoutTramInput[];
    deleteMany?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
};
export type TripCreateNestedManyWithoutRouteInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutRouteInput, Prisma.TripUncheckedCreateWithoutRouteInput> | Prisma.TripCreateWithoutRouteInput[] | Prisma.TripUncheckedCreateWithoutRouteInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutRouteInput | Prisma.TripCreateOrConnectWithoutRouteInput[];
    createMany?: Prisma.TripCreateManyRouteInputEnvelope;
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
};
export type TripUncheckedCreateNestedManyWithoutRouteInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutRouteInput, Prisma.TripUncheckedCreateWithoutRouteInput> | Prisma.TripCreateWithoutRouteInput[] | Prisma.TripUncheckedCreateWithoutRouteInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutRouteInput | Prisma.TripCreateOrConnectWithoutRouteInput[];
    createMany?: Prisma.TripCreateManyRouteInputEnvelope;
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
};
export type TripUpdateManyWithoutRouteNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutRouteInput, Prisma.TripUncheckedCreateWithoutRouteInput> | Prisma.TripCreateWithoutRouteInput[] | Prisma.TripUncheckedCreateWithoutRouteInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutRouteInput | Prisma.TripCreateOrConnectWithoutRouteInput[];
    upsert?: Prisma.TripUpsertWithWhereUniqueWithoutRouteInput | Prisma.TripUpsertWithWhereUniqueWithoutRouteInput[];
    createMany?: Prisma.TripCreateManyRouteInputEnvelope;
    set?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    disconnect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    delete?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    update?: Prisma.TripUpdateWithWhereUniqueWithoutRouteInput | Prisma.TripUpdateWithWhereUniqueWithoutRouteInput[];
    updateMany?: Prisma.TripUpdateManyWithWhereWithoutRouteInput | Prisma.TripUpdateManyWithWhereWithoutRouteInput[];
    deleteMany?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
};
export type TripUncheckedUpdateManyWithoutRouteNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutRouteInput, Prisma.TripUncheckedCreateWithoutRouteInput> | Prisma.TripCreateWithoutRouteInput[] | Prisma.TripUncheckedCreateWithoutRouteInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutRouteInput | Prisma.TripCreateOrConnectWithoutRouteInput[];
    upsert?: Prisma.TripUpsertWithWhereUniqueWithoutRouteInput | Prisma.TripUpsertWithWhereUniqueWithoutRouteInput[];
    createMany?: Prisma.TripCreateManyRouteInputEnvelope;
    set?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    disconnect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    delete?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    update?: Prisma.TripUpdateWithWhereUniqueWithoutRouteInput | Prisma.TripUpdateWithWhereUniqueWithoutRouteInput[];
    updateMany?: Prisma.TripUpdateManyWithWhereWithoutRouteInput | Prisma.TripUpdateManyWithWhereWithoutRouteInput[];
    deleteMany?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
};
export type TripCreateNestedManyWithoutSourceInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutSourceInput, Prisma.TripUncheckedCreateWithoutSourceInput> | Prisma.TripCreateWithoutSourceInput[] | Prisma.TripUncheckedCreateWithoutSourceInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutSourceInput | Prisma.TripCreateOrConnectWithoutSourceInput[];
    createMany?: Prisma.TripCreateManySourceInputEnvelope;
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
};
export type TripUncheckedCreateNestedManyWithoutSourceInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutSourceInput, Prisma.TripUncheckedCreateWithoutSourceInput> | Prisma.TripCreateWithoutSourceInput[] | Prisma.TripUncheckedCreateWithoutSourceInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutSourceInput | Prisma.TripCreateOrConnectWithoutSourceInput[];
    createMany?: Prisma.TripCreateManySourceInputEnvelope;
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
};
export type TripUpdateManyWithoutSourceNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutSourceInput, Prisma.TripUncheckedCreateWithoutSourceInput> | Prisma.TripCreateWithoutSourceInput[] | Prisma.TripUncheckedCreateWithoutSourceInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutSourceInput | Prisma.TripCreateOrConnectWithoutSourceInput[];
    upsert?: Prisma.TripUpsertWithWhereUniqueWithoutSourceInput | Prisma.TripUpsertWithWhereUniqueWithoutSourceInput[];
    createMany?: Prisma.TripCreateManySourceInputEnvelope;
    set?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    disconnect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    delete?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    update?: Prisma.TripUpdateWithWhereUniqueWithoutSourceInput | Prisma.TripUpdateWithWhereUniqueWithoutSourceInput[];
    updateMany?: Prisma.TripUpdateManyWithWhereWithoutSourceInput | Prisma.TripUpdateManyWithWhereWithoutSourceInput[];
    deleteMany?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
};
export type TripUncheckedUpdateManyWithoutSourceNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutSourceInput, Prisma.TripUncheckedCreateWithoutSourceInput> | Prisma.TripCreateWithoutSourceInput[] | Prisma.TripUncheckedCreateWithoutSourceInput[];
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutSourceInput | Prisma.TripCreateOrConnectWithoutSourceInput[];
    upsert?: Prisma.TripUpsertWithWhereUniqueWithoutSourceInput | Prisma.TripUpsertWithWhereUniqueWithoutSourceInput[];
    createMany?: Prisma.TripCreateManySourceInputEnvelope;
    set?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    disconnect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    delete?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    connect?: Prisma.TripWhereUniqueInput | Prisma.TripWhereUniqueInput[];
    update?: Prisma.TripUpdateWithWhereUniqueWithoutSourceInput | Prisma.TripUpdateWithWhereUniqueWithoutSourceInput[];
    updateMany?: Prisma.TripUpdateManyWithWhereWithoutSourceInput | Prisma.TripUpdateManyWithWhereWithoutSourceInput[];
    deleteMany?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type TripCreateNestedOneWithoutGpsPointsInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutGpsPointsInput, Prisma.TripUncheckedCreateWithoutGpsPointsInput>;
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutGpsPointsInput;
    connect?: Prisma.TripWhereUniqueInput;
};
export type TripUpdateOneRequiredWithoutGpsPointsNestedInput = {
    create?: Prisma.XOR<Prisma.TripCreateWithoutGpsPointsInput, Prisma.TripUncheckedCreateWithoutGpsPointsInput>;
    connectOrCreate?: Prisma.TripCreateOrConnectWithoutGpsPointsInput;
    upsert?: Prisma.TripUpsertWithoutGpsPointsInput;
    connect?: Prisma.TripWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TripUpdateToOneWithWhereWithoutGpsPointsInput, Prisma.TripUpdateWithoutGpsPointsInput>, Prisma.TripUncheckedUpdateWithoutGpsPointsInput>;
};
export type TripCreateWithoutUserInput = {
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tram: Prisma.TramCreateNestedOneWithoutTripsInput;
    route: Prisma.RouteCreateNestedOneWithoutTripsInput;
    source?: Prisma.SourceCreateNestedOneWithoutTripsInput;
    gpsPoints?: Prisma.GPSCreateNestedManyWithoutTripInput;
};
export type TripUncheckedCreateWithoutUserInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    tramId: number;
    routeId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    gpsPoints?: Prisma.GPSUncheckedCreateNestedManyWithoutTripInput;
};
export type TripCreateOrConnectWithoutUserInput = {
    where: Prisma.TripWhereUniqueInput;
    create: Prisma.XOR<Prisma.TripCreateWithoutUserInput, Prisma.TripUncheckedCreateWithoutUserInput>;
};
export type TripCreateManyUserInputEnvelope = {
    data: Prisma.TripCreateManyUserInput | Prisma.TripCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type TripUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.TripWhereUniqueInput;
    update: Prisma.XOR<Prisma.TripUpdateWithoutUserInput, Prisma.TripUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.TripCreateWithoutUserInput, Prisma.TripUncheckedCreateWithoutUserInput>;
};
export type TripUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.TripWhereUniqueInput;
    data: Prisma.XOR<Prisma.TripUpdateWithoutUserInput, Prisma.TripUncheckedUpdateWithoutUserInput>;
};
export type TripUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.TripScalarWhereInput;
    data: Prisma.XOR<Prisma.TripUpdateManyMutationInput, Prisma.TripUncheckedUpdateManyWithoutUserInput>;
};
export type TripScalarWhereInput = {
    AND?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
    OR?: Prisma.TripScalarWhereInput[];
    NOT?: Prisma.TripScalarWhereInput | Prisma.TripScalarWhereInput[];
    id?: Prisma.IntFilter<"Trip"> | number;
    startedAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
    endedAt?: Prisma.DateTimeNullableFilter<"Trip"> | Date | string | null;
    status?: Prisma.StringFilter<"Trip"> | string;
    userId?: Prisma.IntNullableFilter<"Trip"> | number | null;
    tramId?: Prisma.IntFilter<"Trip"> | number;
    routeId?: Prisma.IntFilter<"Trip"> | number;
    sourceId?: Prisma.IntNullableFilter<"Trip"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Trip"> | Date | string;
};
export type TripCreateWithoutTramInput = {
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutTripsInput;
    route: Prisma.RouteCreateNestedOneWithoutTripsInput;
    source?: Prisma.SourceCreateNestedOneWithoutTripsInput;
    gpsPoints?: Prisma.GPSCreateNestedManyWithoutTripInput;
};
export type TripUncheckedCreateWithoutTramInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    routeId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    gpsPoints?: Prisma.GPSUncheckedCreateNestedManyWithoutTripInput;
};
export type TripCreateOrConnectWithoutTramInput = {
    where: Prisma.TripWhereUniqueInput;
    create: Prisma.XOR<Prisma.TripCreateWithoutTramInput, Prisma.TripUncheckedCreateWithoutTramInput>;
};
export type TripCreateManyTramInputEnvelope = {
    data: Prisma.TripCreateManyTramInput | Prisma.TripCreateManyTramInput[];
    skipDuplicates?: boolean;
};
export type TripUpsertWithWhereUniqueWithoutTramInput = {
    where: Prisma.TripWhereUniqueInput;
    update: Prisma.XOR<Prisma.TripUpdateWithoutTramInput, Prisma.TripUncheckedUpdateWithoutTramInput>;
    create: Prisma.XOR<Prisma.TripCreateWithoutTramInput, Prisma.TripUncheckedCreateWithoutTramInput>;
};
export type TripUpdateWithWhereUniqueWithoutTramInput = {
    where: Prisma.TripWhereUniqueInput;
    data: Prisma.XOR<Prisma.TripUpdateWithoutTramInput, Prisma.TripUncheckedUpdateWithoutTramInput>;
};
export type TripUpdateManyWithWhereWithoutTramInput = {
    where: Prisma.TripScalarWhereInput;
    data: Prisma.XOR<Prisma.TripUpdateManyMutationInput, Prisma.TripUncheckedUpdateManyWithoutTramInput>;
};
export type TripCreateWithoutRouteInput = {
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutTripsInput;
    tram: Prisma.TramCreateNestedOneWithoutTripsInput;
    source?: Prisma.SourceCreateNestedOneWithoutTripsInput;
    gpsPoints?: Prisma.GPSCreateNestedManyWithoutTripInput;
};
export type TripUncheckedCreateWithoutRouteInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    tramId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    gpsPoints?: Prisma.GPSUncheckedCreateNestedManyWithoutTripInput;
};
export type TripCreateOrConnectWithoutRouteInput = {
    where: Prisma.TripWhereUniqueInput;
    create: Prisma.XOR<Prisma.TripCreateWithoutRouteInput, Prisma.TripUncheckedCreateWithoutRouteInput>;
};
export type TripCreateManyRouteInputEnvelope = {
    data: Prisma.TripCreateManyRouteInput | Prisma.TripCreateManyRouteInput[];
    skipDuplicates?: boolean;
};
export type TripUpsertWithWhereUniqueWithoutRouteInput = {
    where: Prisma.TripWhereUniqueInput;
    update: Prisma.XOR<Prisma.TripUpdateWithoutRouteInput, Prisma.TripUncheckedUpdateWithoutRouteInput>;
    create: Prisma.XOR<Prisma.TripCreateWithoutRouteInput, Prisma.TripUncheckedCreateWithoutRouteInput>;
};
export type TripUpdateWithWhereUniqueWithoutRouteInput = {
    where: Prisma.TripWhereUniqueInput;
    data: Prisma.XOR<Prisma.TripUpdateWithoutRouteInput, Prisma.TripUncheckedUpdateWithoutRouteInput>;
};
export type TripUpdateManyWithWhereWithoutRouteInput = {
    where: Prisma.TripScalarWhereInput;
    data: Prisma.XOR<Prisma.TripUpdateManyMutationInput, Prisma.TripUncheckedUpdateManyWithoutRouteInput>;
};
export type TripCreateWithoutSourceInput = {
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutTripsInput;
    tram: Prisma.TramCreateNestedOneWithoutTripsInput;
    route: Prisma.RouteCreateNestedOneWithoutTripsInput;
    gpsPoints?: Prisma.GPSCreateNestedManyWithoutTripInput;
};
export type TripUncheckedCreateWithoutSourceInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    tramId: number;
    routeId: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    gpsPoints?: Prisma.GPSUncheckedCreateNestedManyWithoutTripInput;
};
export type TripCreateOrConnectWithoutSourceInput = {
    where: Prisma.TripWhereUniqueInput;
    create: Prisma.XOR<Prisma.TripCreateWithoutSourceInput, Prisma.TripUncheckedCreateWithoutSourceInput>;
};
export type TripCreateManySourceInputEnvelope = {
    data: Prisma.TripCreateManySourceInput | Prisma.TripCreateManySourceInput[];
    skipDuplicates?: boolean;
};
export type TripUpsertWithWhereUniqueWithoutSourceInput = {
    where: Prisma.TripWhereUniqueInput;
    update: Prisma.XOR<Prisma.TripUpdateWithoutSourceInput, Prisma.TripUncheckedUpdateWithoutSourceInput>;
    create: Prisma.XOR<Prisma.TripCreateWithoutSourceInput, Prisma.TripUncheckedCreateWithoutSourceInput>;
};
export type TripUpdateWithWhereUniqueWithoutSourceInput = {
    where: Prisma.TripWhereUniqueInput;
    data: Prisma.XOR<Prisma.TripUpdateWithoutSourceInput, Prisma.TripUncheckedUpdateWithoutSourceInput>;
};
export type TripUpdateManyWithWhereWithoutSourceInput = {
    where: Prisma.TripScalarWhereInput;
    data: Prisma.XOR<Prisma.TripUpdateManyMutationInput, Prisma.TripUncheckedUpdateManyWithoutSourceInput>;
};
export type TripCreateWithoutGpsPointsInput = {
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutTripsInput;
    tram: Prisma.TramCreateNestedOneWithoutTripsInput;
    route: Prisma.RouteCreateNestedOneWithoutTripsInput;
    source?: Prisma.SourceCreateNestedOneWithoutTripsInput;
};
export type TripUncheckedCreateWithoutGpsPointsInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    tramId: number;
    routeId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TripCreateOrConnectWithoutGpsPointsInput = {
    where: Prisma.TripWhereUniqueInput;
    create: Prisma.XOR<Prisma.TripCreateWithoutGpsPointsInput, Prisma.TripUncheckedCreateWithoutGpsPointsInput>;
};
export type TripUpsertWithoutGpsPointsInput = {
    update: Prisma.XOR<Prisma.TripUpdateWithoutGpsPointsInput, Prisma.TripUncheckedUpdateWithoutGpsPointsInput>;
    create: Prisma.XOR<Prisma.TripCreateWithoutGpsPointsInput, Prisma.TripUncheckedCreateWithoutGpsPointsInput>;
    where?: Prisma.TripWhereInput;
};
export type TripUpdateToOneWithWhereWithoutGpsPointsInput = {
    where?: Prisma.TripWhereInput;
    data: Prisma.XOR<Prisma.TripUpdateWithoutGpsPointsInput, Prisma.TripUncheckedUpdateWithoutGpsPointsInput>;
};
export type TripUpdateWithoutGpsPointsInput = {
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutTripsNestedInput;
    tram?: Prisma.TramUpdateOneRequiredWithoutTripsNestedInput;
    route?: Prisma.RouteUpdateOneRequiredWithoutTripsNestedInput;
    source?: Prisma.SourceUpdateOneWithoutTripsNestedInput;
};
export type TripUncheckedUpdateWithoutGpsPointsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TripCreateManyUserInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    tramId: number;
    routeId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TripUpdateWithoutUserInput = {
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tram?: Prisma.TramUpdateOneRequiredWithoutTripsNestedInput;
    route?: Prisma.RouteUpdateOneRequiredWithoutTripsNestedInput;
    source?: Prisma.SourceUpdateOneWithoutTripsNestedInput;
    gpsPoints?: Prisma.GPSUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateWithoutUserInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    gpsPoints?: Prisma.GPSUncheckedUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TripCreateManyTramInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    routeId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TripUpdateWithoutTramInput = {
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutTripsNestedInput;
    route?: Prisma.RouteUpdateOneRequiredWithoutTripsNestedInput;
    source?: Prisma.SourceUpdateOneWithoutTripsNestedInput;
    gpsPoints?: Prisma.GPSUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateWithoutTramInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    gpsPoints?: Prisma.GPSUncheckedUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateManyWithoutTramInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TripCreateManyRouteInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    tramId: number;
    sourceId?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TripUpdateWithoutRouteInput = {
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutTripsNestedInput;
    tram?: Prisma.TramUpdateOneRequiredWithoutTripsNestedInput;
    source?: Prisma.SourceUpdateOneWithoutTripsNestedInput;
    gpsPoints?: Prisma.GPSUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateWithoutRouteInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    gpsPoints?: Prisma.GPSUncheckedUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateManyWithoutRouteInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    sourceId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TripCreateManySourceInput = {
    id?: number;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    status?: string;
    userId?: number | null;
    tramId: number;
    routeId: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TripUpdateWithoutSourceInput = {
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutTripsNestedInput;
    tram?: Prisma.TramUpdateOneRequiredWithoutTripsNestedInput;
    route?: Prisma.RouteUpdateOneRequiredWithoutTripsNestedInput;
    gpsPoints?: Prisma.GPSUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateWithoutSourceInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    gpsPoints?: Prisma.GPSUncheckedUpdateManyWithoutTripNestedInput;
};
export type TripUncheckedUpdateManyWithoutSourceInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tramId?: Prisma.IntFieldUpdateOperationsInput | number;
    routeId?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type TripCountOutputType
 */
export type TripCountOutputType = {
    gpsPoints: number;
};
export type TripCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    gpsPoints?: boolean | TripCountOutputTypeCountGpsPointsArgs;
};
/**
 * TripCountOutputType without action
 */
export type TripCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripCountOutputType
     */
    select?: Prisma.TripCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * TripCountOutputType without action
 */
export type TripCountOutputTypeCountGpsPointsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GPSWhereInput;
};
export type TripSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    startedAt?: boolean;
    endedAt?: boolean;
    status?: boolean;
    userId?: boolean;
    tramId?: boolean;
    routeId?: boolean;
    sourceId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.Trip$userArgs<ExtArgs>;
    tram?: boolean | Prisma.TramDefaultArgs<ExtArgs>;
    route?: boolean | Prisma.RouteDefaultArgs<ExtArgs>;
    source?: boolean | Prisma.Trip$sourceArgs<ExtArgs>;
    gpsPoints?: boolean | Prisma.Trip$gpsPointsArgs<ExtArgs>;
    _count?: boolean | Prisma.TripCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["trip"]>;
export type TripSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    startedAt?: boolean;
    endedAt?: boolean;
    status?: boolean;
    userId?: boolean;
    tramId?: boolean;
    routeId?: boolean;
    sourceId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.Trip$userArgs<ExtArgs>;
    tram?: boolean | Prisma.TramDefaultArgs<ExtArgs>;
    route?: boolean | Prisma.RouteDefaultArgs<ExtArgs>;
    source?: boolean | Prisma.Trip$sourceArgs<ExtArgs>;
}, ExtArgs["result"]["trip"]>;
export type TripSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    startedAt?: boolean;
    endedAt?: boolean;
    status?: boolean;
    userId?: boolean;
    tramId?: boolean;
    routeId?: boolean;
    sourceId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.Trip$userArgs<ExtArgs>;
    tram?: boolean | Prisma.TramDefaultArgs<ExtArgs>;
    route?: boolean | Prisma.RouteDefaultArgs<ExtArgs>;
    source?: boolean | Prisma.Trip$sourceArgs<ExtArgs>;
}, ExtArgs["result"]["trip"]>;
export type TripSelectScalar = {
    id?: boolean;
    startedAt?: boolean;
    endedAt?: boolean;
    status?: boolean;
    userId?: boolean;
    tramId?: boolean;
    routeId?: boolean;
    sourceId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TripOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "startedAt" | "endedAt" | "status" | "userId" | "tramId" | "routeId" | "sourceId" | "createdAt" | "updatedAt", ExtArgs["result"]["trip"]>;
export type TripInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.Trip$userArgs<ExtArgs>;
    tram?: boolean | Prisma.TramDefaultArgs<ExtArgs>;
    route?: boolean | Prisma.RouteDefaultArgs<ExtArgs>;
    source?: boolean | Prisma.Trip$sourceArgs<ExtArgs>;
    gpsPoints?: boolean | Prisma.Trip$gpsPointsArgs<ExtArgs>;
    _count?: boolean | Prisma.TripCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TripIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.Trip$userArgs<ExtArgs>;
    tram?: boolean | Prisma.TramDefaultArgs<ExtArgs>;
    route?: boolean | Prisma.RouteDefaultArgs<ExtArgs>;
    source?: boolean | Prisma.Trip$sourceArgs<ExtArgs>;
};
export type TripIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.Trip$userArgs<ExtArgs>;
    tram?: boolean | Prisma.TramDefaultArgs<ExtArgs>;
    route?: boolean | Prisma.RouteDefaultArgs<ExtArgs>;
    source?: boolean | Prisma.Trip$sourceArgs<ExtArgs>;
};
export type $TripPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Trip";
    objects: {
        user: Prisma.$UserPayload<ExtArgs> | null;
        tram: Prisma.$TramPayload<ExtArgs>;
        route: Prisma.$RoutePayload<ExtArgs>;
        source: Prisma.$SourcePayload<ExtArgs> | null;
        gpsPoints: Prisma.$GPSPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        startedAt: Date;
        endedAt: Date | null;
        status: string;
        userId: number | null;
        tramId: number;
        routeId: number;
        sourceId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["trip"]>;
    composites: {};
};
export type TripGetPayload<S extends boolean | null | undefined | TripDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TripPayload, S>;
export type TripCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TripFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TripCountAggregateInputType | true;
};
export interface TripDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Trip'];
        meta: {
            name: 'Trip';
        };
    };
    /**
     * Find zero or one Trip that matches the filter.
     * @param {TripFindUniqueArgs} args - Arguments to find a Trip
     * @example
     * // Get one Trip
     * const trip = await prisma.trip.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TripFindUniqueArgs>(args: Prisma.SelectSubset<T, TripFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Trip that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TripFindUniqueOrThrowArgs} args - Arguments to find a Trip
     * @example
     * // Get one Trip
     * const trip = await prisma.trip.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TripFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TripFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Trip that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripFindFirstArgs} args - Arguments to find a Trip
     * @example
     * // Get one Trip
     * const trip = await prisma.trip.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TripFindFirstArgs>(args?: Prisma.SelectSubset<T, TripFindFirstArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Trip that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripFindFirstOrThrowArgs} args - Arguments to find a Trip
     * @example
     * // Get one Trip
     * const trip = await prisma.trip.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TripFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TripFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Trips that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Trips
     * const trips = await prisma.trip.findMany()
     *
     * // Get first 10 Trips
     * const trips = await prisma.trip.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const tripWithIdOnly = await prisma.trip.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TripFindManyArgs>(args?: Prisma.SelectSubset<T, TripFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Trip.
     * @param {TripCreateArgs} args - Arguments to create a Trip.
     * @example
     * // Create one Trip
     * const Trip = await prisma.trip.create({
     *   data: {
     *     // ... data to create a Trip
     *   }
     * })
     *
     */
    create<T extends TripCreateArgs>(args: Prisma.SelectSubset<T, TripCreateArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Trips.
     * @param {TripCreateManyArgs} args - Arguments to create many Trips.
     * @example
     * // Create many Trips
     * const trip = await prisma.trip.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TripCreateManyArgs>(args?: Prisma.SelectSubset<T, TripCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Trips and returns the data saved in the database.
     * @param {TripCreateManyAndReturnArgs} args - Arguments to create many Trips.
     * @example
     * // Create many Trips
     * const trip = await prisma.trip.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Trips and only return the `id`
     * const tripWithIdOnly = await prisma.trip.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TripCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TripCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Trip.
     * @param {TripDeleteArgs} args - Arguments to delete one Trip.
     * @example
     * // Delete one Trip
     * const Trip = await prisma.trip.delete({
     *   where: {
     *     // ... filter to delete one Trip
     *   }
     * })
     *
     */
    delete<T extends TripDeleteArgs>(args: Prisma.SelectSubset<T, TripDeleteArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Trip.
     * @param {TripUpdateArgs} args - Arguments to update one Trip.
     * @example
     * // Update one Trip
     * const trip = await prisma.trip.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TripUpdateArgs>(args: Prisma.SelectSubset<T, TripUpdateArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Trips.
     * @param {TripDeleteManyArgs} args - Arguments to filter Trips to delete.
     * @example
     * // Delete a few Trips
     * const { count } = await prisma.trip.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TripDeleteManyArgs>(args?: Prisma.SelectSubset<T, TripDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Trips.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Trips
     * const trip = await prisma.trip.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TripUpdateManyArgs>(args: Prisma.SelectSubset<T, TripUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Trips and returns the data updated in the database.
     * @param {TripUpdateManyAndReturnArgs} args - Arguments to update many Trips.
     * @example
     * // Update many Trips
     * const trip = await prisma.trip.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Trips and only return the `id`
     * const tripWithIdOnly = await prisma.trip.updateManyAndReturn({
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
    updateManyAndReturn<T extends TripUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TripUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Trip.
     * @param {TripUpsertArgs} args - Arguments to update or create a Trip.
     * @example
     * // Update or create a Trip
     * const trip = await prisma.trip.upsert({
     *   create: {
     *     // ... data to create a Trip
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Trip we want to update
     *   }
     * })
     */
    upsert<T extends TripUpsertArgs>(args: Prisma.SelectSubset<T, TripUpsertArgs<ExtArgs>>): Prisma.Prisma__TripClient<runtime.Types.Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Trips.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripCountArgs} args - Arguments to filter Trips to count.
     * @example
     * // Count the number of Trips
     * const count = await prisma.trip.count({
     *   where: {
     *     // ... the filter for the Trips we want to count
     *   }
     * })
    **/
    count<T extends TripCountArgs>(args?: Prisma.Subset<T, TripCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TripCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Trip.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TripAggregateArgs>(args: Prisma.Subset<T, TripAggregateArgs>): Prisma.PrismaPromise<GetTripAggregateType<T>>;
    /**
     * Group by Trip.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripGroupByArgs} args - Group by arguments.
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
    groupBy<T extends TripGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TripGroupByArgs['orderBy'];
    } : {
        orderBy?: TripGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TripGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTripGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Trip model
     */
    readonly fields: TripFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Trip.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__TripClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.Trip$userArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Trip$userArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    tram<T extends Prisma.TramDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TramDefaultArgs<ExtArgs>>): Prisma.Prisma__TramClient<runtime.Types.Result.GetResult<Prisma.$TramPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    route<T extends Prisma.RouteDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RouteDefaultArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    source<T extends Prisma.Trip$sourceArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Trip$sourceArgs<ExtArgs>>): Prisma.Prisma__SourceClient<runtime.Types.Result.GetResult<Prisma.$SourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    gpsPoints<T extends Prisma.Trip$gpsPointsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Trip$gpsPointsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GPSPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the Trip model
 */
export interface TripFieldRefs {
    readonly id: Prisma.FieldRef<"Trip", 'Int'>;
    readonly startedAt: Prisma.FieldRef<"Trip", 'DateTime'>;
    readonly endedAt: Prisma.FieldRef<"Trip", 'DateTime'>;
    readonly status: Prisma.FieldRef<"Trip", 'String'>;
    readonly userId: Prisma.FieldRef<"Trip", 'Int'>;
    readonly tramId: Prisma.FieldRef<"Trip", 'Int'>;
    readonly routeId: Prisma.FieldRef<"Trip", 'Int'>;
    readonly sourceId: Prisma.FieldRef<"Trip", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"Trip", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Trip", 'DateTime'>;
}
/**
 * Trip findUnique
 */
export type TripFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * Filter, which Trip to fetch.
     */
    where: Prisma.TripWhereUniqueInput;
};
/**
 * Trip findUniqueOrThrow
 */
export type TripFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * Filter, which Trip to fetch.
     */
    where: Prisma.TripWhereUniqueInput;
};
/**
 * Trip findFirst
 */
export type TripFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * Filter, which Trip to fetch.
     */
    where?: Prisma.TripWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Trips to fetch.
     */
    orderBy?: Prisma.TripOrderByWithRelationInput | Prisma.TripOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Trips.
     */
    cursor?: Prisma.TripWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Trips from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Trips.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Trips.
     */
    distinct?: Prisma.TripScalarFieldEnum | Prisma.TripScalarFieldEnum[];
};
/**
 * Trip findFirstOrThrow
 */
export type TripFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * Filter, which Trip to fetch.
     */
    where?: Prisma.TripWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Trips to fetch.
     */
    orderBy?: Prisma.TripOrderByWithRelationInput | Prisma.TripOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Trips.
     */
    cursor?: Prisma.TripWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Trips from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Trips.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Trips.
     */
    distinct?: Prisma.TripScalarFieldEnum | Prisma.TripScalarFieldEnum[];
};
/**
 * Trip findMany
 */
export type TripFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * Filter, which Trips to fetch.
     */
    where?: Prisma.TripWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Trips to fetch.
     */
    orderBy?: Prisma.TripOrderByWithRelationInput | Prisma.TripOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Trips.
     */
    cursor?: Prisma.TripWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Trips from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Trips.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Trips.
     */
    distinct?: Prisma.TripScalarFieldEnum | Prisma.TripScalarFieldEnum[];
};
/**
 * Trip create
 */
export type TripCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * The data needed to create a Trip.
     */
    data: Prisma.XOR<Prisma.TripCreateInput, Prisma.TripUncheckedCreateInput>;
};
/**
 * Trip createMany
 */
export type TripCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Trips.
     */
    data: Prisma.TripCreateManyInput | Prisma.TripCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Trip createManyAndReturn
 */
export type TripCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * The data used to create many Trips.
     */
    data: Prisma.TripCreateManyInput | Prisma.TripCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Trip update
 */
export type TripUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * The data needed to update a Trip.
     */
    data: Prisma.XOR<Prisma.TripUpdateInput, Prisma.TripUncheckedUpdateInput>;
    /**
     * Choose, which Trip to update.
     */
    where: Prisma.TripWhereUniqueInput;
};
/**
 * Trip updateMany
 */
export type TripUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Trips.
     */
    data: Prisma.XOR<Prisma.TripUpdateManyMutationInput, Prisma.TripUncheckedUpdateManyInput>;
    /**
     * Filter which Trips to update
     */
    where?: Prisma.TripWhereInput;
    /**
     * Limit how many Trips to update.
     */
    limit?: number;
};
/**
 * Trip updateManyAndReturn
 */
export type TripUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * The data used to update Trips.
     */
    data: Prisma.XOR<Prisma.TripUpdateManyMutationInput, Prisma.TripUncheckedUpdateManyInput>;
    /**
     * Filter which Trips to update
     */
    where?: Prisma.TripWhereInput;
    /**
     * Limit how many Trips to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Trip upsert
 */
export type TripUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * The filter to search for the Trip to update in case it exists.
     */
    where: Prisma.TripWhereUniqueInput;
    /**
     * In case the Trip found by the `where` argument doesn't exist, create a new Trip with this data.
     */
    create: Prisma.XOR<Prisma.TripCreateInput, Prisma.TripUncheckedCreateInput>;
    /**
     * In case the Trip was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.TripUpdateInput, Prisma.TripUncheckedUpdateInput>;
};
/**
 * Trip delete
 */
export type TripDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
    /**
     * Filter which Trip to delete.
     */
    where: Prisma.TripWhereUniqueInput;
};
/**
 * Trip deleteMany
 */
export type TripDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Trips to delete
     */
    where?: Prisma.TripWhereInput;
    /**
     * Limit how many Trips to delete.
     */
    limit?: number;
};
/**
 * Trip.user
 */
export type Trip$userArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: Prisma.UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: Prisma.UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
/**
 * Trip.source
 */
export type Trip$sourceArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Source
     */
    select?: Prisma.SourceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Source
     */
    omit?: Prisma.SourceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SourceInclude<ExtArgs> | null;
    where?: Prisma.SourceWhereInput;
};
/**
 * Trip.gpsPoints
 */
export type Trip$gpsPointsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.GPSWhereInput;
    orderBy?: Prisma.GPSOrderByWithRelationInput | Prisma.GPSOrderByWithRelationInput[];
    cursor?: Prisma.GPSWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.GPSScalarFieldEnum | Prisma.GPSScalarFieldEnum[];
};
/**
 * Trip without action
 */
export type TripDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: Prisma.TripSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Trip
     */
    omit?: Prisma.TripOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TripInclude<ExtArgs> | null;
};
//# sourceMappingURL=Trip.d.ts.map