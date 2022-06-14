#!/usr/bin/awk -f

BEGIN {
    InModel=0
    HasAnn=0
}
{
    if($0 ~ /@db/) {
        match($0, /(@db.+$)/, arr)
        print arr[1]
    } else if ($0 ~ /^model/) {
        InModel=1;
        print ""
    } else if (InModel && $0 ~ /^}$/) {
        print "\n";
        if (!HasAnn) print "";
        InModel=0;
        HasAnn=0
    } else if ($0 ~ /@@/) {
        HasAnn=1;
        print ""
    } else print ""
}

